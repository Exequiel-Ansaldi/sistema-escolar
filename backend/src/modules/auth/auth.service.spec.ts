import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtService } from '@nestjs/jwt';

class AuthRepositoryMock {
  static cuentas: Record<
    string,
    {
      id: number;
      nombreUsuario: string;
      contrasena: string;
      rol: { nombreRol: string };
      activo: boolean;
      persona: { nombre: string; apellido: string };
    }
  > = {};
  async findByNombreUsuario(nombreUsuario: string) {
    return AuthRepositoryMock.cuentas[nombreUsuario] ?? null;
  }
}

// bcrypt con hash real costoso; para caracterización se stubbea la comparación
// inyectando una contrasena ya hasheada y comparando contra sí misma.
const contrasenaHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8DZKmPXWQz4l7mB0uKZyV1xQ0yO8Zy';
// bcrypt.compare('admin123', ...) es caro de preparar a mano: se prueba el
// comportamiento vía login completo en los e2e; acá se aísla la lógica de cuenta.

describe('AuthService', () => {
  let service: AuthService;
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    AuthRepositoryMock.cuentas = {
      admin: {
        id: 8,
        nombreUsuario: 'admin',
        contrasena: 'hash-sin-importar-para-este-camino',
        rol: { nombreRol: 'admin' },
        activo: true,
        persona: { nombre: 'Admin', apellido: 'Sistema' },
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('token-fake') };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useClass: AuthRepositoryMock },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('login: cuenta inexistente → 401 y no firma token', async () => {
    await expect(
      service.login({ nombreUsuario: 'nadie', contrasena: 'x' } as never),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('login: cuenta inactiva → 401 sin siquiera comparar contraseña', async () => {
    AuthRepositoryMock.cuentas.admin.activo = false;
    await expect(
      service.login({ nombreUsuario: 'admin', contrasena: 'x' } as never),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('login: contraseña inválida → 401 y no firma token', async () => {
    await expect(
      service.login({
        nombreUsuario: 'admin',
        contrasena: 'incorrecta',
      } as never),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('login: password válida → JWT con payload { id, rol } y datos de la persona', async () => {
    // stub de bcrypt vía contrasena = su propio hash no es viable aquí;
    // se fuerza el camino válido con un hash precalculado de 'admin123'.
    AuthRepositoryMock.cuentas.admin.contrasena =
      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; // hash de "password"
    const bcrypt = require('bcrypt') as { compare: jest.SpyInstance };
    const spy = jest
      .spyOn(bcrypt, 'compare')
      .mockResolvedValue(true as never);
    const resultado = await service.login({
      nombreUsuario: 'admin',
      contrasena: 'cualquiera',
    } as never);
    expect(resultado.accessToken).toBe('token-fake');
    expect(resultado.usuario).toEqual({
      id: 8,
      nombreUsuario: 'admin',
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'admin',
    });
    expect(jwt.sign).toHaveBeenCalledWith({ id: 8, rol: 'admin' });
    spy.mockRestore();
  });
});
