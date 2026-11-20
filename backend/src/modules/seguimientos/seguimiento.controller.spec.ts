import { Test } from '@nestjs/testing';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoService } from './seguimiento.service';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import type { SeguimientoResponse } from './dto/seguimiento-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findByAlumno: jest.fn(),
  create: jest.fn(),
};

const seguimiento: SeguimientoResponse = {
  id: 6,
  alumnoId: 3,
  fecha: '2026-04-15',
  tipo: 'seguimiento',
  titulo: 'Seguimiento pedagógico',
  descripcion: 'Reunión con preceptoría.',
  estado: 'en_proceso',
};

describe('SeguimientoController', () => {
  let controller: SeguimientoController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [SeguimientoController],
      providers: [SeguimientoService],
    })
      .overrideProvider(SeguimientoService)
      .useValue(mockService)
      .compile();
    controller = module.get(SeguimientoController);
    service = module.get(SeguimientoService);
  });

  it('findByAlumno delega alumnoId con la paginación del query', async () => {
    const esperado: PaginatedResult<SeguimientoResponse> = {
      data: [seguimiento],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    };
    service.findByAlumno.mockResolvedValue(esperado);
    const query: PaginacionQueryDto = { page: 2, limit: 5 };

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

  it('create delega el DTO completo', async () => {
    const dto: CrearSeguimientoDto = {
      alumnoId: 3,
      tipo: 'seguimiento',
      titulo: 'Seguimiento pedagógico',
      descripcion: 'Reunión con preceptoría.',
    };
    service.create.mockResolvedValue({ id: 6, ...dto });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 6, titulo: 'Seguimiento pedagógico' });
  });
});
