import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import type {
  DashboardResumenResponse,
  AprobadosPorCursoResponse,
  PromedioPorAnioResponse,
} from './dto/dashboard-response';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  resumen: jest.fn(),
  aprobadosPorCurso: jest.fn(),
  ultimasAsistencias: jest.fn(),
  promedioPorAnio: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService],
    })
      .overrideProvider(DashboardService)
      .useValue(mockService)
      .compile();
    controller = module.get(DashboardController);
    service = module.get(DashboardService);
  });

  it('resumen delega al servicio sin argumentos y devuelve totales + módulos', async () => {
    const esperado: DashboardResumenResponse = {
      totales: { alumnos: 420, docentes: 35, cursos: 21, usuarios: 18 },
      asistenciaHoy: {
        total: 420,
        presentes: 400,
        ausentes: 20,
        fecha: '2026-11-19',
        fechaHoy: '2026-11-20',
      },
      modulos: {
        totalPrevistos: 1000,
        totalDictados: 900,
        eficiencia: 90,
        porMateria: [{ nombre: 'Matemática', previstos: 100, dictados: 95 }],
        porFactor: [{ factor: 'licencia', registros: 3, noDictados: 6 }],
      },
    };
    service.resumen.mockResolvedValue(esperado);

    const result = await controller.resumen();

    expect(service.resumen).toHaveBeenCalledWith();
    expect(result).toEqual(esperado);
  });

  it('aprobadosPorCurso delega al servicio sin argumentos', async () => {
    const esperado: AprobadosPorCursoResponse[] = [
      { anio: 1, turno: 'mañana', aprobados: 18, alumnos: 30 },
    ];
    service.aprobadosPorCurso.mockResolvedValue(esperado);

    const result = await controller.aprobadosPorCurso();

    expect(service.aprobadosPorCurso).toHaveBeenCalledWith();
    expect(result).toEqual(esperado);
  });

  it('ultimasAsistencias convierte el query limite a número', async () => {
    service.ultimasAsistencias.mockResolvedValue([{ id: 1 }]);

    const result = await controller.ultimasAsistencias('5');

    expect(service.ultimasAsistencias).toHaveBeenCalledWith(5);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('ultimasAsistencias sin query usa 10 por defecto', async () => {
    service.ultimasAsistencias.mockResolvedValue([]);

    await controller.ultimasAsistencias();

    expect(service.ultimasAsistencias).toHaveBeenCalledWith(10);
  });

  it('promedioPorAnio delega al servicio sin argumentos', async () => {
    const esperado: PromedioPorAnioResponse[] = [{ anio: 1, promedio: 7.42 }];
    service.promedioPorAnio.mockResolvedValue(esperado);

    const result = await controller.promedioPorAnio();

    expect(service.promedioPorAnio).toHaveBeenCalledWith();
    expect(result).toEqual(esperado);
  });
});
