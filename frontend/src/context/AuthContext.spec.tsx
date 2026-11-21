import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoginResponse } from '../types';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../services/api';

// El provider se prueba SIN RED: el módulo del service se reemplaza por un
// mock; el provider y el consumidor usan el contexto REAL.
vi.mock('../services/api', () => ({
  api: { login: vi.fn() },
}));

const loginMock = vi.mocked(api.login);

const loginResponse: LoginResponse = {
  accessToken: 'tok-abc',
  usuario: { id: 1, nombreUsuario: 'rector', nombre: 'Ana', apellido: 'Pérez', rol: 'rector' },
};

// VERDAD del código: el contexto se crea con un valor por defecto `null!`,
// así que useAuth SIN provider NO lanza — expone null (token, user) y
// callbacks indefinidos. El test fija ese comportamiento sin inventar uno.
function Consumidor() {
  const { user, token } = useAuth();
  return (
    <div>
      <span>token: {token ?? 'sin-token'}</span>
      <span>usuario: {user ? `${user.nombre} ${user.apellido}` : 'sin-usuario'}</span>
    </div>
  );
}

function ConsumidorConAcciones() {
  const { user, token, login, logout } = useAuth();
  return (
    <div>
      <span>token: {token ?? 'sin-token'}</span>
      <span>usuario: {user ? `${user.nombre} ${user.apellido}` : 'sin-usuario'}</span>
      <button onClick={() => login('rector', 'rector123')}>Ingresar</button>
      <button onClick={logout}>Salir</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthContext', () => {
  it('login exitoso guarda token y usuario en el estado y en localStorage', async () => {
    loginMock.mockResolvedValue(loginResponse);

    render(
      <AuthProvider>
        <ConsumidorConAcciones />
      </AuthProvider>,
    );

    expect(screen.getByText('token: sin-token')).toBeInTheDocument();
    expect(screen.getByText('usuario: sin-usuario')).toBeInTheDocument();

    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));

    await screen.findByText('usuario: Ana Pérez');
    expect(screen.getByText('token: tok-abc')).toBeInTheDocument();
    expect(loginMock).toHaveBeenCalledWith({ nombreUsuario: 'rector', contrasena: 'rector123' });
    expect(localStorage.getItem('token')).toBe('tok-abc');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(loginResponse.usuario));
  });

  it('logout limpia el estado y el almacenamiento', async () => {
    localStorage.setItem('token', 'tok-guardado');
    localStorage.setItem('user', JSON.stringify(loginResponse.usuario));

    render(
      <AuthProvider>
        <ConsumidorConAcciones />
      </AuthProvider>,
    );

    // Estado inicial restaurado desde localStorage (token + user persistidos).
    await screen.findByText('usuario: Ana Pérez');
    expect(screen.getByText('token: tok-guardado')).toBeInTheDocument();

    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Salir' }));

    await screen.findByText('usuario: sin-usuario');
    expect(screen.getByText('token: sin-token')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('useAuth sin provider lanza al consumir el contexto nulo', () => {
    // VERDAD del código: el default del contexto es `null!`, así que
    // useContext NO lanza por sí mismo, pero desestructurar ese null sí
    // lanza TypeError dentro del componente consumidor.
    expect(() => render(<Consumidor />)).toThrow(TypeError);
  });
});
