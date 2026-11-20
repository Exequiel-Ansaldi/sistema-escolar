import { ConflictException, NotFoundException } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';
import type { AsistenciaRepository } from './repositories/asistencia.repository';
import type { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import type { DiasSinClasesRepository } from '../dias-sin-clases/repositories/dias-sin-clases.repository';

type InscripcionMini = { id: number; estado: string; cursoId: number };
type AlumnoMini = {
  id: number;
  inscripciones?: InscripcionMini[];
};

function dobleAsistencia(opciones: {
  alumnos: AlumnoMini[];
  diasSinClases?: { fecha: Date; tipo: string; cursoId: number | null }[];
}) {
  const creados: unknown[] = [];
  const asistenciaRepo = {
    findByAlumno: async () => [],
    findByCursoYFecha: async (cursoId: number, fecha: string) => [
      {
        id: 7,
        alumnoId: opciones.alumnos[0]?.id ?? 1,
        fecha: new Date(fecha).toISOString(),
        estado: 'presente',
        observacion: null,
        alumno: {
          id: opciones.alumnos[0]?.id ?? 1,
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
    ],
    buscarPorAlumno: async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    create: async (data: Record<string, unknown>) => {
      creados.push(data);
      return data;
    },
    createMany: async (datos: unknown[]) => {
      creados.push(...datos);
      return { count: datos.length };
    },
    update: async () => ({}),
  } as unknown as AsistenciaRepository;

  const alumnosRepo = {
    findById: async (id: number) =>
      opciones.alumnos.find((a) => a.id === id) ?? null,
    findByDni: async () => null,
  } as unknown as AlumnosRepository;

  const diasRepo = {
    findEntreFechas: async () => opciones.diasSinClases ?? [],
  } as unknown as DiasSinClasesRepository;

  return {
    service: new AsistenciaService(asistenciaRepo, alumnosRepo, diasRepo),
    creados,
  };
}

function alumno(id: number, inscripciones: InscripcionMini[]): AlumnoMini {
  return { id, inscripciones };
}

// 2026-07-12 es domingo; 2026-07-09 es jueves.
const DOMINGO = '2026-07-12';
const JUEVES = '2026-07-09';

describe('AsistenciaService (caracterización)', () => {
  it('registrar: alumno sin inscripción activa → 409 "no tiene un curso activo"', async () => {
    const { service } = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'inactivo', cursoId: 3 }])],
    });
    await expect(
      service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(ConflictException);
  });

  it('registrar: alumno inexistente → 404', async () => {
    const { service } = dobleAsistencia({ alumnos: [] });
    await expect(
      service.registrar({ alumnoId: 99, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('registrar: domingo → 409 con motivo fin_de_semana', async () => {
    const { service } = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
    });
    await expect(
      service.registrar({ alumnoId: 1, fecha: DOMINGO } as CrearAsistenciaDto),
    ).rejects.toThrow(/no hay clases para este curso \(fin_de_semana\)/);
  });

  it('registrar: DiaSinClases global (cursoId null) y del curso → 409; de otro curso → pasa', async () => {
    const global = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
      diasSinClases: [{ fecha: new Date(JUEVES), tipo: 'paro', cursoId: null }],
    });
    await expect(
      global.service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(/\(paro\)/);

    const delCurso = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
      diasSinClases: [{ fecha: new Date(JUEVES), tipo: 'asamblea', cursoId: 3 }],
    });
    await expect(
      delCurso.service.registrar({ alumnoId: 1, fecha: JUEVES } as CrearAsistenciaDto),
    ).rejects.toThrow(ConflictException);

    const otroCurso = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
      diasSinClases: [{ fecha: new Date(JUEVES), tipo: 'paro', cursoId: 999 }],
    });
    await otroCurso.service.registrar({
      alumnoId: 1,
      fecha: JUEVES,
    } as CrearAsistenciaDto);
    expect(otroCurso.creados).toHaveLength(1);
  });

  it('registrar: justificada=true persiste estado "justificado"; si no, "ausente"', async () => {
    const conJustificada = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
    });
    await conJustificada.service.registrar({
      alumnoId: 1,
      fecha: JUEVES,
      justificada: true,
    } as CrearAsistenciaDto);
    expect((conJustificada.creados[0] as { estado: string }).estado).toBe('justificado');

    const sinJustificar = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
    });
    await sinJustificar.service.registrar({
      alumnoId: 1,
      fecha: JUEVES,
    } as CrearAsistenciaDto);
    expect((sinJustificar.creados[0] as { estado: string }).estado).toBe('ausente');
  });

  it('masivo: valida alumno por alumno (404 / 409) y transforma justificada → estado', async () => {
    const { service } = dobleAsistencia({
      alumnos: [
        alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }]),
        alumno(2, [{ id: 6, estado: 'inactivo', cursoId: 3 }]),
      ],
    });
    await expect(
      service.registrarMasivo([
        { alumnoId: 99, fecha: JUEVES },
        { alumnoId: 2, fecha: JUEVES },
      ] as CrearAsistenciaDto[]),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.registrarMasivo([
        { alumnoId: 2, fecha: JUEVES },
      ] as CrearAsistenciaDto[]),
    ).rejects.toThrow(ConflictException);
  });

  it('findByCursoYFecha en día sin clases: NO lanza, marca estado "no_corresponde"', async () => {
    const { service } = dobleAsistencia({
      alumnos: [alumno(1, [{ id: 5, estado: 'activo', cursoId: 3 }])],
      diasSinClases: [{ fecha: new Date(JUEVES), tipo: 'paro', cursoId: null }],
    });
    const result = await service.findByCursoYFecha(3, JUEVES);
    expect(result[0].estado).toBe('no_corresponde');
  });
});
