import { Test } from '@nestjs/testing';
import { DiasSinClasesController } from './dias-sin-clases.controller';
import { DiasSinClasesService } from './dias-sin-clases.service';
import { CrearDiaSinClasesDto } from './dto/crear-dia-sin-clases.dto';
import { FiltrarDiasSinClasesDto } from './dto/filtrar-dias-sin-clases.dto';
import { DiaSinClasesResponse } from './dto/dia-sin-clases-response';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
const mockService = {
  listar: jest.fn(),
  crear: jest.fn(),
  eliminar: jest.fn(),
};

const dia: DiaSinClasesResponse = {
  id: 9,
  fecha: '2026-05-25T00:00:00.000Z',
  tipo: 'feriado',
  descripcion: '25 de Mayo',
  cursoId: null,
  createdAt: '2026-01-10T12:00:00.000Z',
};

const paginado = (
  data: DiaSinClasesResponse[],
): PaginatedResult<DiaSinClasesResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('DiasSinClasesController', () => {
  let controller: DiasSinClasesController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [DiasSinClasesController],
      providers: [DiasSinClasesService],
    })
      .overrideProvider(DiasSinClasesService)
      .useValue(mockService)
      .compile();
    controller = module.get(DiasSinClasesController);
    service = module.get(DiasSinClasesService);
  });

  it('listar sin query delega undefined/defaults al servicio', async () => {
    service.listar.mockResolvedValue(paginado([dia]));
    const result = await controller.listar({} as FiltrarDiasSinClasesDto);
    expect(service.listar).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      1,
      10,
    );
    expect(result).toEqual(paginado([dia]));
  });

  it('listar pasa desde/hasta/cursoId y la paginación al servicio', async () => {
    service.listar.mockResolvedValue(paginado([]));
    const query = {
      desde: '2026-05-01',
      hasta: '2026-05-31',
      cursoId: 3,
      page: 2,
      limit: 5,
    } as FiltrarDiasSinClasesDto;
    await controller.listar(query);
    expect(service.listar).toHaveBeenCalledWith(
      '2026-05-01',
      '2026-05-31',
      3,
      2,
      5,
    );
  });

  it('crear delega el DTO completo (las fechas ya viajan como ISO string)', async () => {
    const dto = {
      fecha: '2026-05-25',
      tipo: 'paro',
      descripcion: 'Paro de 1°A',
      cursoId: 3,
    } as CrearDiaSinClasesDto;
    service.crear.mockResolvedValue({ ...dia, tipo: 'paro', cursoId: 3 });
    const result = await controller.crear(dto);
    expect(service.crear).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ tipo: 'paro', cursoId: 3 });
  });

  it('eliminar delega el id al servicio', async () => {
    service.eliminar.mockResolvedValue(undefined);
    await controller.eliminar(9);
    expect(service.eliminar).toHaveBeenCalledWith(9);
  });
});
