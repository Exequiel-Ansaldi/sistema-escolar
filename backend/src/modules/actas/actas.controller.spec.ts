import { Test } from '@nestjs/testing';
import { ActasController } from './actas.controller';
import { ActasService } from './actas.service';
import { CrearActaDto } from './dto/crear-acta.dto';
import { FiltrarActasDto } from './dto/filtrar-actas.dto';
import { ActaResponse } from './dto/acta-response';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
const mockService = {
  findByAlumno: jest.fn(),
  create: jest.fn(),
};

const acta: ActaResponse = {
  id: 2,
  alumnoId: 7,
  fecha: '2026-04-15T00:00:00.000Z',
  tipo: 'compromiso',
  descripcion: 'Compromiso de estudio',
  numero: 'ACT-2026-0002',
};

const paginado = (data: ActaResponse[]): PaginatedResult<ActaResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('ActasController', () => {
  let controller: ActasController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [ActasController],
      providers: [ActasService],
    })
      .overrideProvider(ActasService)
      .useValue(mockService)
      .compile();
    controller = module.get(ActasController);
    service = module.get(ActasService);
  });

  it('findByAlumno usa los valores por defecto de paginación', async () => {
    service.findByAlumno.mockResolvedValue(paginado([acta]));
    const result = await controller.findByAlumno(7, {} as FiltrarActasDto);
    expect(service.findByAlumno).toHaveBeenCalledWith(7, 1, 10);
    expect(result).toEqual(paginado([acta]));
  });

  it('findByAlumno pasa page/limit de la query al servicio', async () => {
    service.findByAlumno.mockResolvedValue(paginado([]));
    const query = { page: 2, limit: 5 } as FiltrarActasDto;
    await controller.findByAlumno(7, query);
    expect(service.findByAlumno).toHaveBeenCalledWith(7, 2, 5);
  });

  it('create delega el DTO completo (fecha en ISO string según contrato del frontend)', async () => {
    const dto = {
      alumnoId: 7,
      fecha: '2026-04-15',
      tipo: 'compromiso',
      descripcion: 'Compromiso de estudio',
      numero: 'ACT-2026-0002',
    } as CrearActaDto;
    service.create.mockResolvedValue(acta);
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(acta);
  });
});
