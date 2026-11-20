import { Test } from '@nestjs/testing';
import { ModulosMensualesController } from './modulos-mensuales.controller';
import { ModulosMensualesService } from './modulos-mensuales.service';
import { CrearModuloMensualDto } from './dto/crear-modulo-mensual.dto';
import { ActualizarModuloMensualDto } from './dto/actualizar-modulo-mensual.dto';
import { FiltrarModulosMensualesDto } from './dto/filtrar-modulos-mensuales.dto';
import type {
  ModuloMensualResponse,
  ModulosMensualesMesResponse,
} from './dto/modulo-mensual-response';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findByMes: jest.fn(),
  upsert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const moduloMensual: ModuloMensualResponse = {
  id: 12,
  docenteId: 2,
  cursoId: 5,
  materiaId: 7,
  mes: '2026-03-01T00:00:00.000Z',
  modulosPrevistos: 20,
  modulosDictados: 18,
  noDictados: [{ id: 1, factor: 'licencia', cantidad: 2 }],
  observacion: null,
};

describe('ModulosMensualesController', () => {
  let controller: ModulosMensualesController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [ModulosMensualesController],
      providers: [ModulosMensualesService],
    })
      .overrideProvider(ModulosMensualesService)
      .useValue(mockService)
      .compile();
    controller = module.get(ModulosMensualesController);
    service = module.get(ModulosMensualesService);
  });

  it('findByMes pasa mes, paginación y filtros al servicio', async () => {
    const esperado: ModulosMensualesMesResponse = {
      data: [moduloMensual],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
      totalPrevistos: 20,
      totalDictados: 18,
    };
    service.findByMes.mockResolvedValue(esperado);
    const query: FiltrarModulosMensualesDto = {
      mes: '2026-03',
      page: 2,
      limit: 5,
      anio: 3,
      division: 'A',
      turno: 'tarde',
      materiaId: 7,
    };

    const result = await controller.findByMes(query);

    expect(service.findByMes).toHaveBeenCalledWith('2026-03', 2, 5, {
      anio: 3,
      division: 'A',
      turno: 'tarde',
      materiaId: 7,
    });
    expect(result).toEqual(esperado);
  });

  it('findByMes sin query usa page=1 y limit=10 por defecto', async () => {
    service.findByMes.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      totalPrevistos: 0,
      totalDictados: 0,
    });

    await controller.findByMes({ mes: '2026-03' });

    expect(service.findByMes).toHaveBeenCalledWith('2026-03', 1, 10, {
      anio: undefined,
      division: undefined,
      turno: undefined,
      materiaId: undefined,
    });
  });

  it('upsert delega el DTO completo', async () => {
    const dto: CrearModuloMensualDto = {
      docenteId: 2,
      cursoId: 5,
      materiaId: 7,
      mes: '2026-03',
      modulosPrevistos: 20,
      modulosDictados: 18,
      noDictados: [{ factor: 'licencia', cantidad: 2 }],
    };
    service.upsert.mockResolvedValue(moduloMensual);

    const result = await controller.upsert(dto);

    expect(service.upsert).toHaveBeenCalledWith(dto);
    expect(result).toEqual(moduloMensual);
  });

  it('update delega id y el DTO parcial', async () => {
    const dto: ActualizarModuloMensualDto = { modulosDictados: 19 };
    service.update.mockResolvedValue({
      ...moduloMensual,
      modulosDictados: 19,
    });

    const result = await controller.update(12, dto);

    expect(service.update).toHaveBeenCalledWith(12, dto);
    expect(result).toMatchObject({ id: 12, modulosDictados: 19 });
  });

  it('delete delega el id del DELETE', async () => {
    service.delete.mockResolvedValue({ id: 12 });

    const result = await controller.delete(12);

    expect(service.delete).toHaveBeenCalledWith(12);
    expect(result).toEqual({ id: 12 });
  });
});
