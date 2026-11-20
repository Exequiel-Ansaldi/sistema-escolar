import { Test } from '@nestjs/testing';
import { CursoMateriaController } from './curso-materia.controller';
import { CursoMateriaService } from './curso-materia.service';
import { AsignarMateriaCursoDto } from './dto/asignar-materia-curso.dto';
import { AsignarMateriaMasivoDto } from './dto/asignar-materia-masivo.dto';
import { ActualizarCargaHorariaDto } from './dto/actualizar-carga-horaria.dto';
import { FiltrarCursoMateriaDto } from './dto/filtrar-curso-materia.dto';
import {
  CursoMateriaResponse,
  CursoGruposResponse,
} from './dto/curso-materia-response';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
const mockService = {
  findAll: jest.fn(),
  findGrupos: jest.fn(),
  findByCurso: jest.fn(),
  asignar: jest.fn(),
  asignarMasivo: jest.fn(),
  actualizarCarga: jest.fn(),
  quitar: jest.fn(),
};

const cursoMateria: CursoMateriaResponse = {
  cursoId: 1,
  materiaId: 5,
  cargaHoraria: 72,
  modulosPorSemana: 2,
};

const paginado = <T>(data: T[]): PaginatedResult<T> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('CursoMateriaController', () => {
  let controller: CursoMateriaController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CursoMateriaController],
      providers: [CursoMateriaService],
    })
      .overrideProvider(CursoMateriaService)
      .useValue(mockService)
      .compile();
    controller = module.get(CursoMateriaController);
    service = module.get(CursoMateriaService);
  });

  it('findAll delega filtro y paginación al servicio', async () => {
    service.findAll.mockResolvedValue(paginado([cursoMateria]));
    const query = { anio: '1', division: 'A', turno: 'mañana', page: 2, limit: 5 } as FiltrarCursoMateriaDto;
    const result = await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith('1', 'A', 'mañana', 2, 5);
    expect(result).toEqual(paginado([cursoMateria]));
  });

  it('findGrupos delega filtro y paginación al servicio (vista de carga horaria)', async () => {
    const grupo: CursoGruposResponse = {
      id: 1,
      anio: 1,
      division: 'A',
      turno: 'mañana',
      orientacion: '',
      cicloLectivo: 2026,
      estado: 'activo',
      materias: [cursoMateria],
    };
    service.findGrupos.mockResolvedValue(paginado([grupo]));
    const result = await controller.findGrupos({ page: 1, limit: 1 } as FiltrarCursoMateriaDto);
    expect(service.findGrupos).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      1,
      1,
    );
    expect(result).toEqual(paginado([grupo]));
  });

  it('findByCurso delega el cursoId al servicio', async () => {
    service.findByCurso.mockResolvedValue([cursoMateria]);
    const result = await controller.findByCurso(1);
    expect(service.findByCurso).toHaveBeenCalledWith(1);
    expect(result).toEqual([cursoMateria]);
  });

  it('asignar delega el DTO completo al servicio', async () => {
    const dto = { cursoId: 1, materiaId: 5, cargaHoraria: 72 } as AsignarMateriaCursoDto;
    service.asignar.mockResolvedValue(cursoMateria);
    const result = await controller.asignar(dto);
    expect(service.asignar).toHaveBeenCalledWith(dto);
    expect(result).toEqual(cursoMateria);
  });

  it('asignarMasivo desestructura el DTO en (cursoIds, materiaId, modulosPorSemana)', async () => {
    const dto = {
      cursoIds: [1, 2, 3],
      materiaId: 5,
      modulosPorSemana: 4,
    } as AsignarMateriaMasivoDto;
    service.asignarMasivo.mockResolvedValue({ asignados: 3, omitidos: 0 });
    const result = await controller.asignarMasivo(dto);
    expect(service.asignarMasivo).toHaveBeenCalledWith([1, 2, 3], 5, 4);
    expect(result).toEqual({ asignados: 3, omitidos: 0 });
  });

  it('actualizarCarga delega (cursoId, materiaId) y el DTO', async () => {
    const dto = { modulosPorSemana: 4 } as ActualizarCargaHorariaDto;
    service.actualizarCarga.mockResolvedValue({ ...cursoMateria, modulosPorSemana: 4 });
    const result = await controller.actualizarCarga(1, 5, dto);
    expect(service.actualizarCarga).toHaveBeenCalledWith(1, 5, dto);
    expect(result).toMatchObject({ modulosPorSemana: 4 });
  });

  it('quitar delega (cursoId, materiaId) al servicio', async () => {
    service.quitar.mockResolvedValue(undefined);
    await controller.quitar(1, 5);
    expect(service.quitar).toHaveBeenCalledWith(1, 5);
  });
});
