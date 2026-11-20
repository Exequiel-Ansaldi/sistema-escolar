import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { LoginResponse } from './dto/login-response.dto';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio.
const mockService = {
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockService)
      .compile();
    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  it('login delega el DTO de credenciales y devuelve accessToken + usuario', async () => {
    const dto: LoginDto = { nombreUsuario: 'admin', contrasena: 'admin123' };
    const esperado: LoginResponse = {
      accessToken: 'jwt-de-prueba',
      usuario: {
        id: 1,
        nombreUsuario: 'admin',
        nombre: 'Ada',
        apellido: 'Lovelace',
        rol: 'admin',
      },
    };
    service.login.mockResolvedValue(esperado);

    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(esperado);
  });

  it('POST /auth/login responde con HttpCode 200', () => {
    expect(
      Reflect.getMetadata('__httpCode__', AuthController.prototype.login),
    ).toBe(200);
  });
});
