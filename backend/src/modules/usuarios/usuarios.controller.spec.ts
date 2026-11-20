import { Test } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { FiltrarUsuariosDto } from './dto/filtrar-usuarios.dto';
import { UsuarioResponse } from './dto/usuario-response';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
const mockService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  disable: jest.fn(),
};

const usuario: UsuarioResponse = {
  id: 3,
  nombreUsuario: 'mgomez',
  nombre: 'Marta',
  apellido: 'Gómez',
  activo: true,
  rolId: 2,
};

const paginado = (data: UsuarioResponse[]): PaginatedResult<UsuarioResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [UsuariosService],
    })
      .overrideProvider(UsuariosService)
      .useValue(mockService)
      .compile();
    controller = module.get(UsuariosController);
    service = module.get(UsuariosService);
  });

  it('findAll usa los valores por defecto cuando la query no trae paginación', async () => {
    service.findAll.mockResolvedValue(paginado([usuario]));
    const result = await controller.findAll({} as FiltrarUsuariosDto);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(paginado([usuario]));
  });

  it('findAll pasa page y limit de la query al servicio', async () => {
    service.findAll.mockResolvedValue(paginado([]));
    await controller.findAll({ page: 2, limit: 5 } as FiltrarUsuariosDto);
    expect(service.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('findById delega el id (ParseIntPipe resuelto por Nest)', async () => {
    service.findById.mockResolvedValue(usuario);
    const result = await controller.findById(3);
    expect(service.findById).toHaveBeenCalledWith(3);
    expect(result).toEqual(usuario);
  });

  it('create delega el DTO completo (el hasheo de contraseña vive en el service)', async () => {
    const dto = {
      nombreUsuario: 'jperez',
      contrasena: 'secret123',
      nombre: 'Juan',
      apellido: 'Pérez',
      rolId: 2,
    } as CrearUsuarioDto;
    service.create.mockResolvedValue(usuario);
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(usuario);
  });

  it('update delega el id y el DTO', async () => {
    const dto = { nombre: 'María' } as ActualizarUsuarioDto;
    service.update.mockResolvedValue({ ...usuario, nombre: 'María' });
    const result = await controller.update(3, dto);
    expect(service.update).toHaveBeenCalledWith(3, dto);
    expect(result).toMatchObject({ nombre: 'María' });
  });

  it('disable delega el id (baja lógica)', async () => {
    service.disable.mockResolvedValue({ ...usuario, activo: false });
    const result = await controller.disable(3);
    expect(service.disable).toHaveBeenCalledWith(3);
    expect(result).toMatchObject({ activo: false });
  });
});
