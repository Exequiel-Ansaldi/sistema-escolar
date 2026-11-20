import { Test } from '@nestjs/testing';
import { InscripcionController } from './inscripcion.controller';
import { InscripcionService } from './inscripcion.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { FiltrarInscripcionesDto } from './dto/filtrar-inscripciones.dto';
import type { InscripcionResponse } from './dto/inscripcion-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findAll: jest.fn(),
  inscribir: jest.fn(),
  desinscribir: jest.fn(),
};

const inscripcion: InscripcionResponse = {
  id: 1,
  alumnoId: 3,
  cursoId: 5,
  fechaInscripcion: '2026-03-02T00:00:00.000Z',
  estado: 'activo',
};

describe('InscripcionController', () => {
  let controller: InscripcionController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [InscripcionController],
      providers: [InscripcionService],
    })
      .overrideProvider(InscripcionService)
      .useValue(mockService)
      .compile();
    controller = module.get(InscripcionController);
    service = module.get(InscripcionService);
  });

  it('listar pasa page/limit y los filtros de curso al servicio', async () => {
    const esperado: PaginatedResult<InscripcionResponse> = {
      data: [inscripcion],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    };
    service.findAll.mockResolvedValue(esperado);
    const query: FiltrarInscripcionesDto = {
      page: 2,
      limit: 5,
      anio: 3,
      division: 'A',
      turno: 'tarde',
    };

    const result = await controller.listar(query);

    expect(service.findAll).toHaveBeenCalledWith(2, 5, {
      anio: 3,
      division: 'A',
      turno: 'tarde',
    });
    expect(result).toEqual(esperado);
  });

  it('listar sin query usa page=1 y limit=10 por defecto', async () => {
    service.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await controller.listar({});

    expect(service.findAll).toHaveBeenCalledWith(1, 10, {
      anio: undefined,
      division: undefined,
      turno: undefined,
    });
  });

  it('inscribir delega el DTO completo', async () => {
    const dto: CrearInscripcionDto = { alumnoId: 3, cursoId: 5 };
    service.inscribir.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.inscribir(dto);

    expect(service.inscribir).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 1, alumnoId: 3, cursoId: 5 });
  });

  it('desinscribir delega alumnoId y cursoId del DELETE', async () => {
    service.desinscribir.mockResolvedValue({ id: 1, estado: 'inactivo' });

    const result = await controller.desinscribir(3, 5);

    expect(service.desinscribir).toHaveBeenCalledWith(3, 5);
    expect(result).toMatchObject({ id: 1 });
  });
});
