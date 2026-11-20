import { Test } from '@nestjs/testing';
import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';
import { FiltrarDocentesDto } from './dto/filtrar-docentes.dto';
import { DocenteResponse } from './dto/docente-response';
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

const docente: DocenteResponse = {
  id: 4,
  dni: '25999888',
  nombre: 'Laura',
  apellido: 'Suárez',
  telefono: '3704001122',
  email: 'lsuarez@escuela.edu.ar',
  fechaIngreso: '2023-03-01T00:00:00.000Z',
  estado: 'activo',
};

const paginado = (data: DocenteResponse[]): PaginatedResult<DocenteResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('DocentesController', () => {
  let controller: DocentesController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [DocentesController],
      providers: [DocentesService],
    })
      .overrideProvider(DocentesService)
      .useValue(mockService)
      .compile();
    controller = module.get(DocentesController);
    service = module.get(DocentesService);
  });

  it('findAll pasa page/limit/search al servicio (search indefinido si la query no lo trae)', async () => {
    service.findAll.mockResolvedValue(paginado([docente]));
    const result = await controller.findAll({} as FiltrarDocentesDto);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
    expect(result).toEqual(paginado([docente]));
  });

  it('findAll con query completa delega page/limit/search', async () => {
    service.findAll.mockResolvedValue(paginado([]));
    await controller.findAll({ page: 3, limit: 20, search: 'suarez' } as FiltrarDocentesDto);
    expect(service.findAll).toHaveBeenCalledWith(3, 20, 'suarez');
  });

  it('findById delega el id (ParseIntPipe resuelto por Nest)', async () => {
    service.findById.mockResolvedValue(docente);
    const result = await controller.findById(4);
    expect(service.findById).toHaveBeenCalledWith(4);
    expect(result).toEqual(docente);
  });

  it('create delega el DTO completo', async () => {
    const dto = {
      dni: '25999888',
      nombre: 'Laura',
      apellido: 'Suárez',
      telefono: '3704001122',
      email: 'lsuarez@escuela.edu.ar',
      fechaIngreso: '2023-03-01T00:00:00.000Z',
    } as CrearDocenteDto;
    service.create.mockResolvedValue(docente);
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(docente);
  });

  it('update delega el id y el DTO', async () => {
    const dto = { telefono: '3704009988' } as ActualizarDocenteDto;
    service.update.mockResolvedValue({ ...docente, telefono: '3704009988' });
    const result = await controller.update(4, dto);
    expect(service.update).toHaveBeenCalledWith(4, dto);
    expect(result).toMatchObject({ telefono: '3704009988' });
  });

  it('disable delega el id (baja lógica)', async () => {
    service.disable.mockResolvedValue({ ...docente, estado: 'inactivo' });
    const result = await controller.disable(4);
    expect(service.disable).toHaveBeenCalledWith(4);
    expect(result).toMatchObject({ estado: 'inactivo' });
  });
});
