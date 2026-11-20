import { Test } from '@nestjs/testing';
import { CalificacionesController } from './calificaciones.controller';
import { CalificacionesService } from './calificaciones.service';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { ActualizarCalificacionDto } from './dto/actualizar-calificacion.dto';
import { FiltrarCalificacionesDto } from './dto/filtrar-calificaciones.dto';
import type {
  CalificacionResponse,
  PromedioAlumnoResponse,
  PromedioPorTrimestreResponse,
  PromedioPorMateriaResponse,
} from './dto/calificacion-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findByAlumno: jest.fn(),
  findByAlumnoYMateria: jest.fn(),
  promedio: jest.fn(),
  promedioPorTrimestre: jest.fn(),
  promedioPorMateria: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const calificacion: CalificacionResponse = {
  id: 11,
  alumnoId: 3,
  materiaId: 7,
  nota: 8,
  trimestre: 1,
  fecha: '2026-04-10',
  observacion: null,
};

describe('CalificacionesController', () => {
  let controller: CalificacionesController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CalificacionesController],
      providers: [CalificacionesService],
    })
      .overrideProvider(CalificacionesService)
      .useValue(mockService)
      .compile();
    controller = module.get(CalificacionesController);
    service = module.get(CalificacionesService);
  });

  it('findByAlumno delega alumnoId con la paginación del query', async () => {
    const esperado: PaginatedResult<CalificacionResponse> = {
      data: [calificacion],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    };
    service.findByAlumno.mockResolvedValue(esperado);
    const query: FiltrarCalificacionesDto = { page: 2, limit: 5 };

    const result = await controller.findByAlumno(3, query);

    expect(service.findByAlumno).toHaveBeenCalledWith(3, 2, 5);
    expect(result).toEqual(esperado);
  });

  it('findByAlumno sin query usa page=1 y limit=10 por defecto', async () => {
    service.findByAlumno.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await controller.findByAlumno(3, {});

    expect(service.findByAlumno).toHaveBeenCalledWith(3, 1, 10);
  });

  it('promedio delega el alumnoId al servicio', async () => {
    const esperado: PromedioAlumnoResponse = { _avg: { nota: 7.5 }, _count: 4 };
    service.promedio.mockResolvedValue(esperado);

    const result = await controller.promedio(3);

    expect(service.promedio).toHaveBeenCalledWith(3);
    expect(result).toEqual(esperado);
  });

  it('promedioPorTrimestre delega el alumnoId al servicio', async () => {
    const esperado: PromedioPorTrimestreResponse[] = [
      { trimestre: 1, promedio: 7.5, count: 4 },
      { trimestre: 2, promedio: null, count: 0 },
    ];
    service.promedioPorTrimestre.mockResolvedValue(esperado);

    const result = await controller.promedioPorTrimestre(3);

    expect(service.promedioPorTrimestre).toHaveBeenCalledWith(3);
    expect(result).toEqual(esperado);
  });

  it('promedioPorMateria delega el alumnoId al servicio', async () => {
    const esperado: PromedioPorMateriaResponse[] = [
      { materiaId: 7, promedio: 8.25, count: 4 },
    ];
    service.promedioPorMateria.mockResolvedValue(esperado);

    const result = await controller.promedioPorMateria(3);

    expect(service.promedioPorMateria).toHaveBeenCalledWith(3);
    expect(result).toEqual(esperado);
  });

  it('findByAlumnoYMateria delega alumnoId y materiaId de la ruta', async () => {
    service.findByAlumnoYMateria.mockResolvedValue([calificacion]);

    const result = await controller.findByAlumnoYMateria(3, 7);

    expect(service.findByAlumnoYMateria).toHaveBeenCalledWith(3, 7);
    expect(result).toEqual([calificacion]);
  });

  it('create delega el DTO completo', async () => {
    const dto: CrearCalificacionDto = {
      alumnoId: 3,
      materiaId: 7,
      nota: 8,
      trimestre: 1,
      fecha: '2026-04-10',
    };
    service.create.mockResolvedValue({ id: 11, ...dto });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 11, nota: 8 });
  });

  it('update delega id y el DTO parcial', async () => {
    const dto: ActualizarCalificacionDto = { nota: 9 };
    service.update.mockResolvedValue({ ...calificacion, nota: 9 });

    const result = await controller.update(11, dto);

    expect(service.update).toHaveBeenCalledWith(11, dto);
    expect(result).toMatchObject({ id: 11, nota: 9 });
  });
});
