import { Test } from '@nestjs/testing';
import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio.
const mockService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn((dto) => ({ id: 1, ...dto })),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  disable: jest.fn((id) => ({ id, estado: 'inactivo' })),
};

describe('AlumnosController', () => {
  let controller: AlumnosController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AlumnosController],
      providers: [AlumnosService],
    })
      .overrideProvider(AlumnosService)
      .useValue(mockService)
      .compile();
    controller = module.get(AlumnosController);
    service = module.get(AlumnosService);
  });

  it('findAll pasa page/limit/search al servicio', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await controller.findAll({ page: 2, limit: 5, search: 'acosta' } as never);
    expect(service.findAll).toHaveBeenCalledWith(2, 5, 'acosta');
    expect(result).toMatchObject({ total: 0 });
  });

  it('findById usa ParseIntPipe resuelto por Nest y delega el id', async () => {
    service.findById.mockResolvedValue({ id: 7 });
    await controller.findById(7);
    expect(service.findById).toHaveBeenCalledWith(7);
  });

  it('create delega el DTO completo', async () => {
    const dto = { dni: '40100999', nombre: 'A', apellido: 'B' };
    await controller.create(dto as never);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delega el id y el DTO (validación de DNI duplicado vive en el service)', async () => {
    const dto = { nombre: 'A2', telefono: '3704001122' } as never;
    service.update.mockResolvedValue({ id: 3, nombre: 'A2', estado: 'activo' });
    const result = await controller.update(3, dto);
    expect(service.update).toHaveBeenCalledWith(3, dto);
    expect(result).toMatchObject({ id: 3 });
  });

  it('disable delega el id (baja lógica)', async () => {
    service.disable.mockResolvedValue({ id: 3, estado: 'inactivo' });
    const result = await controller.disable(3);
    expect(service.disable).toHaveBeenCalledWith(3);
    expect(result).toMatchObject({ estado: 'inactivo' });
  });
});
