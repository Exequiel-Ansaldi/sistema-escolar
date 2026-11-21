import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { api } from '../services/api';
import type { LoginResponse, UsuarioSesion } from '../types';

// T3 (spec S3) — Contenedor Login: la página conoce el servicio, el test lo
// reemplaza con un doble ("en un test, onLogin es una función falsa").
// Nada de red: api.login es un mock que resuelve/rechaza a demanda.
vi.mock('../services/api', () => ({
  api: { login: vi.fn() },
}));

const usuario: UsuarioSesion = {
  id: 7, nombreUsuario: 'ana', nombre: 'Ana', apellido: 'García', rol: 'admin',
};

// Router mínimo: /login monta la página; / sirve para verificar la
// navegación posterior al login exitoso.
function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>Panel principal</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Login (contenedor con api mockeada)', () => {
  it('render inicial: muestra los campos y sus labels', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('Ingrese su usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingrese su contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.getByText('Usuario')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
  });

  // HALLAZGO de accesibilidad (cátedra: labels asociadas con htmlFor/id): las
  // labels del Login no llevan htmlFor y los inputs no tienen id, así que
  // getByLabelText no los encuentra. Se documenta el comportamiento real;
  // arreglarlo tocaría Login.tsx (fuera del alcance de este batch de specs).
  it('labels asociadas a los inputs (htmlFor/id, cátedra Login.md §8)', () => {
    renderLogin();

    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('credenciales válidas: llama a api.login con las credenciales, guarda el token en localStorage y navega al inicio', async () => {
    const respuesta: LoginResponse = { accessToken: 'token-de-prueba-123', usuario };
    vi.mocked(api.login).mockResolvedValueOnce(respuesta);
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ingrese su usuario'), 'ana');
    await user.type(screen.getByPlaceholderText('Ingrese su contraseña'), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    // El login exitoso navega a "/" (AuthContext.login persiste el token)
    expect(await screen.findByText('Panel principal')).toBeInTheDocument();
    expect(vi.mocked(api.login)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.login)).toHaveBeenCalledWith({ nombreUsuario: 'ana', contrasena: 'secreto123' });
    // El token queda en localStorage (clave "token", usuario en "user")
    expect(localStorage.getItem('token')).toBe('token-de-prueba-123');
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toMatchObject({ rol: 'admin', nombreUsuario: 'ana' });
  });

  it('credenciales inválidas: muestra un mensaje de error genérico y no guarda token', async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error('Credenciales inválidas'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ingrese su usuario'), 'ana');
    await user.type(screen.getByPlaceholderText('Ingrese su contraseña'), 'clave-mala');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    // El mensaje mostrado es exactamente el error del servicio (genérico, no
    // revela cuál campo falló — cátedra §4.4)
    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    // Sigue en la pantalla de login
    expect(screen.getByPlaceholderText('Ingrese su usuario')).toBeInTheDocument();
    // No persiste nada tras el rechazo
    expect(localStorage.getItem('token')).toBeNull();
    // El error se anuncia con role="alert" (cátedra §4.4, corregido 2026-11-20)
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas');
  });
});
