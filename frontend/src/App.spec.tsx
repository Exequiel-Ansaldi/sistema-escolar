import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { api } from './services/api';
import type { PaginatedResult } from './services/api';
import type { DashboardResumen } from './types';

// T3 (spec S3) — Protección de rutas de App.tsx con el AuthProvider real y la
// api mockeada (nada de red: las páginas que llegan a renderizar resuelven
// con paginados vacíos).
vi.mock('./services/api', () => {
  const paginadoVacio = () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 });
  return {
    api: {
      login: vi.fn(),
      getAlumnos: vi.fn(() => Promise.resolve(paginadoVacio())),
      getCursos: vi.fn(() => Promise.resolve(paginadoVacio())),
      getDashboard: vi.fn(() => Promise.resolve({ totales: {}, asistenciaHoy: { total: 0, presentes: 0, ausentes: 0 } })),
      getAprobadosPorCurso: vi.fn(() => Promise.resolve([])),
      getPromedioPorAnio: vi.fn(() => Promise.resolve([])),
    },
  };
});

function paginadoVacio<T>(): PaginatedResult<T> {
  return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
}

const resumenVacio: DashboardResumen = {
  totales: { alumnos: 0, docentes: 0, cursos: 0, usuarios: 0 },
  asistenciaHoy: { total: 0, presentes: 0, ausentes: 0 },
};

// AuthProvider lee token/user de localStorage al montar (igual que el flujo real).
function sembrarSesion(rol: string) {
  localStorage.setItem('token', 'token-de-prueba');
  localStorage.setItem('user', JSON.stringify({ id: 1, nombreUsuario: 'test', nombre: 'Test', apellido: 'Usuario', rol }));
}

// App envuelve sus rutas en BrowserRouter: la ruta inicial se elige con pushState.
function irA(ruta: string) {
  window.history.pushState({}, '', ruta);
}

// El setup global limpia localStorage y hace restoreAllMocks después de cada
// test: se re-arman los mocks y se siembra la sesión por test.
beforeEach(() => {
  vi.mocked(api.getAlumnos).mockResolvedValue(paginadoVacio());
  vi.mocked(api.getCursos).mockResolvedValue(paginadoVacio());
  vi.mocked(api.getDashboard).mockResolvedValue(resumenVacio);
  vi.mocked(api.getAprobadosPorCurso).mockResolvedValue([]);
  vi.mocked(api.getPromedioPorAnio).mockResolvedValue([]);
});

describe('Protección de rutas (App)', () => {
  it('sin token: /alumnos redirige a /login', async () => {
    irA('/alumnos');
    render(<App />);

    expect(await screen.findByText('Inicia sesión para continuar')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    // La página protegida nunca llegó a pedir datos
    expect(vi.mocked(api.getAlumnos)).not.toHaveBeenCalled();
  });

  // rutaInicial('preceptor_manana') = /cursos (primera entrada accesible del mapa)
  it('con rol sin acceso: preceptor_manana en /docentes redirige a su primera ruta accesible (/cursos)', async () => {
    sembrarSesion('preceptor_manana');
    irA('/docentes');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Cursos' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/cursos');
    expect(screen.queryByRole('heading', { name: 'Docentes' })).toBeNull();
    expect(vi.mocked(api.getCursos)).toHaveBeenCalled();
  });

  // HALLAZGO (comportamiento real): AuthProvider inicia user en null y lo
  // hidrata desde localStorage en un useEffect, que corre DESPUÉS del primer
  // render. El primer render de ProtectedRoute evalúa puedeAcceder(undefined)
  // → false, y redirige a rutaInicial(undefined) = '/'. Al recargar con sesión
  // guardada, un rol con acceso al Dashboard termina en '/' y no en la ruta
  // pedida. Este spec documenta ese rebote; arreglarlo tocaría AuthContext.
  it('documenta el rebote por hidratación: admin que recarga /alumnos con sesión guardada termina en / (Dashboard)', async () => {
    sembrarSesion('admin');
    irA('/alumnos');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  // Con el usuario ya hidratado, la navegación por el menú respeta el acceso:
  // admin puede entrar a /alumnos y la página renderiza (sin redirección).
  it('con rol con acceso: admin ya hidratado navega a /alumnos y la ruta renderiza', async () => {
    const user = userEvent.setup();
    sembrarSesion('admin');
    irA('/');
    render(<App />);

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('link', { name: 'Alumnos' }));

    expect(await screen.findByRole('heading', { name: 'Alumnos' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/alumnos');
    // admin puede escribir: ve el botón "Nuevo" (vista no de solo lectura)
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });
});
