import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaRepository } from './repositories/asistencia.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { DiasSinClasesRepository } from '../dias-sin-clases/repositories/dias-sin-clases.repository';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';

type InscripcionMini = { id: number; estado: string; cursoId: number };
type AlumnoMini = { id: number; inscripciones?: InscripcionMini[] };

class AsistenciaRepositoryMock {
  static creados: unknown[] = [];
  async findByAlumno() {
    return [];
  }
  async findByCursoYFecha(cursoId: number, fecha: string) {
    return [
      {
        id: 7,
        alumnoId: 1,
        fecha: new Date(fecha).toISOString(),
        estado: 'presente',
        observacion: null,
        alumno: {
          id: 1,
          dni: '40100001',
          nombre: 'A',
          apellido: 'B',
          nacimiento: '2010-01-01',
          direccion: 'x',
          telefono: '11',
          estado: 'activo',
          fechaIngreso: '2026-03-01',
          fechaEgreso: null,
        },
        cursoId,
      },
    ];
  }
  async buscarPorAlumno() {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
  async create(data: Record<string, unknown>) {
    AsistenciaRepositoryMock.creados.push(data);
    return data;
  }
  async createMany(datos: unknown[]) {
    AsistenciaRepositoryMock.creados.push(...datos);
    return { count: datos.length };
  }
  async update() {
    return {};
  }
}

class AlumnosRepositoryMock {
  static alumnos: AlumnoMini[] = [];
  async findById(id: number) {
    return AlumnosRepositoryMock.alumnos.find((a) => a.id === id) ?? null;
  }
  async findByDni() {
    return null;
  }
}

class DiasSinClasesRepositoryMock {
  static registros: { fecha: Date; tipo: string; cursoId: number | null }[] = [];
  async findEntreFechas() {
    return DiasSinClasesRepositoryMock.registros;
  }
}

// 2026-07-12 es domingo; 2026-07-09 es jueves.
const DOMINGO = '2026-07-12';
const JUEVES = '2026-07-09';

describe('AsistenciaService', () => {
  let service: AsistenciaService;

  beforeEach(async () => {
    AlumnosRepositoryMock.alumnos = [];
    DiasSinClasesRepositoryMock.registros = [];
    AsistenciaRepositoryMock.creados = [];
    const module = await Test.createTestingModule({
      providers: [
        AsistenciaService,
        { provide: AsistenciaRepository, useClass: AsistenciaRepositoryMock },
        { provide: AlumnosRepository, useClass: AlumnosRepositoryMock },
        {
          provide: DiasSinClasesRepository,
          useClass: DiasSinClasesRepositoryMock,
        },
      ],
    }).compile();
    service = module.get(AsistenciaService);
  });

  it('registrar: alumno sin inscripción activa → 409', async () => {
    AlumnosRepositoryMock.alumnos = [
      { id: 1, inscripciones: [{ id: 5, estado: 'inactivo', cursoId: 3 }] },
    ];
    await expect(
      service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(ConflictException);
  });

  it('registrar: alumno inexistente → 404', async () => {
    await expect(
      service.registrar({ alumnoId: 99, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('registrar: fin de semana → 409 con motivo fin_de_semana', async () => {
    AlumnosRepositoryMock.alumnos = [
      { id: 1, inscripciones: [{ id: 5, estado: 'activo', cursoId: 3 }] },
    ];
    await expect(
      service.registrar({ alumnoId: 1, fecha: DOMINGO } as CrearAsistenciaDto),
    ).rejects.toThrow(/no hay clases para este curso \(fin_de_semana\)/);
  });

  it('registrar: DiaSinClases global (cursoId null) y del curso → 409; de otro curso → pasa', async () => {
    AlumnosRepositoryMock.alumnos = [
      { id: 1, inscripciones: [{ id: 5, estado: 'activo', cursoId: 3 }] },
    ];
    DiasSinClasesRepositoryMock.registros = [
      { fecha: new Date(JUEVES), tipo: 'paro', cursoId: null },
    ];
    await expect(
      service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(/\(paro\)/);

    DiasSinClasesRepositoryMock.registros = [
      { fecha: new Date(JUEVES), tipo: 'asamblea', cursoId: 3 },
    ];
    await expect(
      service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(ConflictException);

    DiasSinClasesRepositoryMock.registros = [
      { fecha: new Date(JUEVES), tipo: 'paro', cursoId: 999 },
    ];
    await service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto);
    expect(AsistenciaRepositoryMock.creados).toHaveLength(1);
  });

  it('registrar: justificada=true persiste "justificado"; si no, "ausente"', async () => {
    AlumnosRepositoryMock.alumnos = [
      { id: 1, inscripciones: [{ id: 5, estado: 'activo', cursoId: 3 }] },
    ];
    await service.registrar({
      alumnoId: 1,
      fecha: JUEVES,
      justificada: true,
    } as CrearAsistenciaDto);
    expect((AsistenciaRepositoryMock.creados[0] as { estado: string }).estado).toBe(
      'justificado',
    );

    await service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto);
    expect((AsistenciaRepositoryMock.creados[1] as { estado: string }).estado).toBe(
      'ausente',
    );
  });

  it('masivo: valida alumno por alumno (404 / 409) y transforma justificada → estado', async () => {
    AlumnosRepositoryMock.alumnos = [
      { id: 1, inscripciones: [{ id: 5, estado: 'activo', cursoId: 3 }] },
      { id: 2, inscripciones: [{ id: 6, estado: 'inactivo', cursoId: 3 }] },
    ];
    await expect(
      service.registrarMasivo([
        { alumnoId: 99, fecha: JUEVES },
        { alumnoId: 2, fecha: JUEVES },
      ] as CrearAsistenciaDto[]),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.registrarMasivo([{ alumnoId: 2, fecha: JUEVES }] as CrearAsistenciaDto[]),
    ).rejects.toThrow(ConflictException);
  });

  it('findByCursoYFecha en día sin clases: NO lanza, marca "no_corresponde"', async () => {
    AlumnosRepositoryMock.alumnos = [
      { id: 1, inscripciones: [{ id: 5, estado: 'activo', cursoId: 3 }] },
    ];
    DiasSinClasesRepositoryMock.registros = [
      { fecha: new Date(JUEVES), tipo: 'paro', cursoId: null },
    ];
    const result = await service.findByCursoYFecha(3, JUEVES);
    expect(result[0].estado).toBe('no_corresponde');
  });
});
