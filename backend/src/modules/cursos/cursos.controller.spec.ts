import { Test } from '@nestjs/testing';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';
import { FiltrarCursosDto } from './dto/filtrar-cursos.dto';
import { CursoResponse } from './dto/curso-response';
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

const curso: CursoResponse = {
  id: 21,
  anio: 1,
  division: 'A',
  turno: 'mañana',
  orientacion: '',
  cicloLectivo: 2026,
  estado: 'activo',
};

const paginado = (data: CursoResponse[]): PaginatedResult<CursoResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('CursosController', () => {
  let controller: CursosController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CursosController],
      providers: [CursosService],
    })
      .overrideProvider(CursosService)
      .useValue(mockService)
      .compile();
    controller = module.get(CursosController);
    service = module.get(CursosService);
  });

  it('findAll delega la paginación y el filtro de (año, división, turno) por defecto', async () => {
    service.findAll.mockResolvedValue(paginado([curso]));
    const result = await controller.findAll({} as FiltrarCursosDto);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, {
      anio: undefined,
      division: undefined,
      turno: undefined,
    });
    expect(result).toEqual(paginado([curso]));
  });

  it('findAll pasa page/limit y los filtros de la query al servicio', async () => {
    service.findAll.mockResolvedValue(paginado([curso]));
    const query = { page: 2, limit: 5, anio: 3, division: 'B', turno: 'noche' } as FiltrarCursosDto;
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(2, 5, {
      anio: 3,
      division: 'B',
      turno: 'noche',
    });
  });

  it('findById delega el id (ParseIntPipe resuelto por Nest)', async () => {
    service.findById.mockResolvedValue(curso);
    const result = await controller.findById(21);
    expect(service.findById).toHaveBeenCalledWith(21);
    expect(result).toEqual(curso);
  });

  it('create delega el DTO completo', async () => {
    const dto = {
      anio: 2,
      division: 'C',
      turno: 'tarde',
      orientacion: '',
      cicloLectivo: 2026,
    } as CrearCursoDto;
    service.create.mockResolvedValue({ ...curso, id: 22, anio: 2, division: 'C', turno: 'tarde' });
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 22, division: 'C' });
  });

  it('update delega el id y el DTO', async () => {
    const dto = { division: 'D' } as ActualizarCursoDto;
    service.update.mockResolvedValue({ ...curso, division: 'D' });
    const result = await controller.update(21, dto);
    expect(service.update).toHaveBeenCalledWith(21, dto);
    expect(result).toMatchObject({ division: 'D' });
  });

  it('disable delega el id (baja lógica)', async () => {
    service.disable.mockResolvedValue({ ...curso, estado: 'inactivo' });
    const result = await controller.disable(21);
    expect(service.disable).toHaveBeenCalledWith(21);
    expect(result).toMatchObject({ estado: 'inactivo' });
  });
});
