import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import type { Alumno, Curso, LoginResponse } from '../types';

// Service Layer probado SIN RED: `fetch` se reemplaza por un doble global
// (vi.stubGlobal) y las respuestas son objetos con la forma que `request`
// consume (ok, statusText, json). Los asserts verifican la URL EXACTA que
// recibió el fetch, para fijar el prefijo /api del BASE.
function respuesta(cuerpo: unknown, ok = true): Response {
  return {
    ok,
    statusText: 'Error de prueba',
    json: () => Promise.resolve(cuerpo),
  } as unknown as Response;
}

function respuestaSinJson(statusText: string): Response {
  return {
    ok: false,
    statusText,
    json: () => Promise.reject(new SyntaxError('JSON inválido')),
  } as unknown as Response;
}

function stubFetch(respuestaFalsa: () => Response) {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuestaFalsa());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function cabecerasDe(fetchMock: ReturnType<typeof stubFetch>): Record<string, string> {
  return (fetchMock.mock.calls[0][1]?.headers ?? {}) as unknown as Record<string, string>;
}

function alumno(id: number, nombre: string): Alumno {
  return {
    id,
    dni: '30111222',
    nombre,
    apellido: 'García',
    nacimiento: '2008-03-15',
    direccion: 'Calle Falsa 123',
    telefono: '3794000000',
    estado: 'activo',
    fechaIngreso: '2024-02-20',
  };
}

function curso(id: number, division: string): Curso {
  return { id, anio: 1, division, turno: 'mañana', orientacion: 'Bachiller', cicloLectivo: 2026, estado: 'activo' };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Service Layer (services/api)', () => {
  describe('request — cabeceras y autenticación', () => {
    it('agrega Authorization: Bearer con el token guardado en localStorage', async () => {
      localStorage.setItem('token', 'jwt-de-prueba');
      const fetchMock = stubFetch(() => respuesta({ totales: { alumnos: 0, docentes: 0, cursos: 0, usuarios: 0 } }));

      await api.getDashboard();

      const cabeceras = cabecerasDe(fetchMock);
      expect(cabeceras['Authorization']).toBe('Bearer jwt-de-prueba');
      expect(cabeceras['Content-Type']).toBe('application/json');
    });

    it('no agrega Authorization cuando no hay token en localStorage', async () => {
      const fetchMock = stubFetch(() => respuesta({ totales: { alumnos: 0, docentes: 0, cursos: 0, usuarios: 0 } }));

      await api.getDashboard();

      const cabeceras = cabecerasDe(fetchMock);
      expect(cabeceras['Authorization']).toBeUndefined();
      expect(cabeceras['Content-Type']).toBe('application/json');
    });
  });

  it('login hace POST a /api/auth/login con el body serializado como JSON', async () => {
    const loginResponse: LoginResponse = {
      accessToken: 'tok-abc',
      usuario: { id: 1, nombreUsuario: 'rector', nombre: 'Ana', apellido: 'Pérez', rol: 'rector' },
    };
    const fetchMock = stubFetch(() => respuesta(loginResponse));
    const credenciales = { nombreUsuario: 'rector', contrasena: 'rector123' };

    const res = await api.login(credenciales);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/login');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify(credenciales));
    expect(cabecerasDe(fetchMock)['Content-Type']).toBe('application/json');
    expect(res).toEqual(loginResponse);
  });

  describe('manejo de errores', () => {
    it('lanza el message del body JSON cuando la respuesta no es ok', async () => {
      stubFetch(() => respuesta({ message: 'Credenciales inválidas' }, false));

      await expect(api.login({ nombreUsuario: 'admin', contrasena: 'mala' })).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    it('usa el statusText como mensaje cuando el body no es JSON válido', async () => {
      stubFetch(() => respuestaSinJson('No autorizado'));

      await expect(api.getAlumno(1)).rejects.toThrow('No autorizado');
    });
  });

  describe('listados completos', () => {
    it('getAllAlumnos pide limit=9999 y devuelve data del paginado', async () => {
      const alumnos = [alumno(1, 'Ana'), alumno(2, 'Beto')];
      const fetchMock = stubFetch(() => respuesta({ data: alumnos, total: 2, page: 1, limit: 9999, totalPages: 1 }));

      const res = await api.getAllAlumnos();

      expect(fetchMock.mock.calls[0][0]).toBe('/api/alumnos?limit=9999');
      expect(res).toEqual(alumnos);
    });

    it('getAllCursos pide limit=9999 y devuelve data del paginado', async () => {
      const cursos = [curso(1, 'A'), curso(2, 'B')];
      const fetchMock = stubFetch(() => respuesta({ data: cursos, total: 2, page: 1, limit: 9999, totalPages: 1 }));

      const res = await api.getAllCursos();

      expect(fetchMock.mock.calls[0][0]).toBe('/api/cursos?limit=9999');
      expect(res).toEqual(cursos);
    });
  });

  it('prefija todas las URLs con /api', async () => {
    const fetchMock = stubFetch(() => respuesta({ data: [], total: 0, page: 2, limit: 20, totalPages: 0 }));

    await api.getAlumnos(2, 20);

    expect(fetchMock.mock.calls[0][0]).toBe('/api/alumnos?page=2&limit=20');
  });
});
