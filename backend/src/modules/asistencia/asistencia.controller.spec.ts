import { Test } from '@nestjs/testing';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';
import { RegistrarAsistenciasMasivoDto } from './dto/registrar-asistencias-masivo.dto';
import { FiltrarAsistenciasBuscarDto } from './dto/filtrar-asistencias-buscar.dto';
import type {
  AsistenciaResponse,
  AsistenciaCursoResponse,
  AsistenciaBuscarResponse,
} from './dto/asistencia-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findByAlumno: jest.fn(),
  findByCursoYFecha: jest.fn(),
  buscarPorAlumno: jest.fn(),
  registrar: jest.fn(),
  registrarMasivo: jest.fn(),
};

const asistencia: AsistenciaResponse = {
  id: 9,
  alumnoId: 3,
  fecha: '2026-03-02',
  estado: 'ausente',
  justificacion: null,
  observacion: null,
};

describe('AsistenciaController', () => {
  let controller: AsistenciaController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AsistenciaController],
      providers: [AsistenciaService],
    })
      .overrideProvider(AsistenciaService)
      .useValue(mockService)
      .compile();
    controller = module.get(AsistenciaController);
    service = module.get(AsistenciaService);
  });

  it('findByAlumno delega el alumnoId de la ruta', async () => {
    service.findByAlumno.mockResolvedValue([asistencia]);

    const result = await controller.findByAlumno(3);

    expect(service.findByAlumno).toHaveBeenCalledWith(3);
    expect(result).toEqual([asistencia]);
  });

  it('findByCursoYFecha delega cursoId y fecha del query', async () => {
    const registros: AsistenciaCursoResponse[] = [
      {
        id: 9,
        alumnoId: 3,
        fecha: '2026-03-02',
        estado: 'presente',
        observacion: null,
        alumno: {
          id: 3,
          nombre: 'Ada',
          apellido: 'Lovelace',
          dni: '40100999',
          nacimiento: '2009-05-11',
          direccion: 'Calle 1',
          telefono: '2210000000',
          estado: 'activo',
          fechaIngreso: '2024-03-01',
        },
      },
    ];
    service.findByCursoYFecha.mockResolvedValue(registros);

    const result = await controller.findByCursoYFecha(5, '2026-03-02');

    expect(service.findByCursoYFecha).toHaveBeenCalledWith(5, '2026-03-02');
    expect(result).toEqual(registros);
  });

  it('buscar pasa q, fecha, paginación y filtros al servicio', async () => {
    const esperado: PaginatedResult<AsistenciaBuscarResponse> = {
      data: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
    };
    service.buscarPorAlumno.mockResolvedValue(esperado);
    const query: FiltrarAsistenciasBuscarDto = {
      q: 'lovelace',
      fecha: '2026-03-02',
      page: 2,
      limit: 5,
      anio: 3,
      division: 'A',
      turno: 'tarde',
    };

    const result = await controller.buscarPorAlumno(query);

    expect(service.buscarPorAlumno).toHaveBeenCalledWith(
      'lovelace',
      '2026-03-02',
      2,
      5,
      { anio: 3, division: 'A', turno: 'tarde' },
    );
    expect(result).toEqual(esperado);
  });

  it('buscar sin query usa page=1 y limit=10 por defecto', async () => {
    service.buscarPorAlumno.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await controller.buscarPorAlumno({
      q: 'lovelace',
      fecha: '2026-03-02',
    });

    expect(service.buscarPorAlumno).toHaveBeenCalledWith(
      'lovelace',
      '2026-03-02',
      1,
      10,
      { anio: undefined, division: undefined, turno: undefined },
    );
  });

  it('registrar delega el DTO individual', async () => {
    const dto: CrearAsistenciaDto = {
      alumnoId: 3,
      fecha: '2026-03-02',
      justificada: true,
    };
    service.registrar.mockResolvedValue({ id: 9, estado: 'justificado' });

    const result = await controller.registrar(dto);

    expect(service.registrar).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 9, estado: 'justificado' });
  });

  it('registrarMasivo desenvuelve el array y delega solo los datos', async () => {
    const dto: RegistrarAsistenciasMasivoDto = {
      datos: [
        { alumnoId: 3, fecha: '2026-03-02' },
        { alumnoId: 4, fecha: '2026-03-02' },
      ],
    };
    service.registrarMasivo.mockResolvedValue({ count: 2 });

    const result = await controller.registrarMasivo(dto);

    expect(service.registrarMasivo).toHaveBeenCalledWith(dto.datos);
    expect(result).toEqual({ count: 2 });
  });
});
