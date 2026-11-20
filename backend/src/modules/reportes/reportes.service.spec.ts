import { NotFoundException } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import type { ReportesRepository } from './repositories/reportes.repository';

type AlumnoMini = {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  inscripciones: { curso: { anio: number; division: string; turno: string } }[];
  calificaciones?: {
    materia: { nombre: string };
    trimestre: number;
    nota: number;
  }[];
};

function dobleReportes(opciones: {
  alumnoCalificaciones?: AlumnoMini | null;
  alumnoInscripciones?: AlumnoMini | null;
  asistencias?: {
    fecha: Date;
    estado: string;
    justificacion?: string | null;
    observacion?: string | null;
  }[];
  curso?: {
    anio: number;
    division: string;
    turno: string;
    orientacion: string;
    cicloLectivo: number;
    inscripciones: { alumno: { apellido: string; nombre: string; dni: string } }[];
    materias: { materia: { nombre: string } }[];
    modulosMensuales: {
      mes: Date;
      materia: { nombre: string };
      modulosPrevistos: number;
      modulosDictados: number;
      noDictados: { factor: string; cantidad: number }[];
    }[];
  } | null;
}) {
  const consultasAsistencia: unknown[] = [];
  const repo = {
    findAlumnoWithCalificaciones: async () =>
      opciones.alumnoCalificaciones ?? null,
    findAlumnoWithInscripciones: async () =>
      opciones.alumnoInscripciones ?? null,
    findAsistencias: async (_alumnoId: number, where: unknown) => {
      consultasAsistencia.push(where);
      return opciones.asistencias ?? [];
    },
    findCursoWithAll: async () => opciones.curso ?? null,
  } as unknown as ReportesRepository;
  return { service: new ReportesService(repo), consultasAsistencia };
}

const alumnoBase: AlumnoMini = {
  id: 1,
  dni: '40100001',
  nombre: 'Bautista',
  apellido: 'Acosta',
  inscripciones: [{ curso: { anio: 1, division: 'A', turno: 'mañana' } }],
  calificaciones: [
    { materia: { nombre: 'Matemática' }, trimestre: 1, nota: 8 },
    { materia: { nombre: 'Matemática' }, trimestre: 2, nota: 9 },
  ],
};

const cursoBase = {
  anio: 1,
  division: 'A',
  turno: 'mañana',
  orientacion: 'Ciclo Básico',
  cicloLectivo: 2026,
  inscripciones: [
    { alumno: { apellido: 'Acosta', nombre: 'Bautista', dni: '40100001' } },
  ],
  materias: [{ materia: { nombre: 'Matemática' } }],
  modulosMensuales: [
    {
      mes: new Date(Date.UTC(2026, 6, 1)),
      materia: { nombre: 'Matemática' },
      modulosPrevistos: 20,
      modulosDictados: 18,
      noDictados: [{ factor: 'feriado', cantidad: 2 }],
    },
  ],
};

describe('ReportesService (caracterización)', () => {
  it('reporteCalificaciones: alumno inexistente → 404', async () => {
    const { service } = dobleReportes({ alumnoCalificaciones: null });
    await expect(service.reporteCalificaciones(99)).rejects.toThrow(
      new NotFoundException('Alumno no encontrado'),
    );
  });

  it('reporteAsistencia: alumno inexistente → 404', async () => {
    const { service } = dobleReportes({ alumnoInscripciones: null });
    await expect(service.reporteAsistencia(99)).rejects.toThrow(
      new NotFoundException('Alumno no encontrado'),
    );
  });

  it('reporteCurso: curso inexistente → 404', async () => {
    const { service } = dobleReportes({ curso: null });
    await expect(service.reporteCurso(99)).rejects.toThrow(
      new NotFoundException('Curso no encontrado'),
    );
  });

  it('reporteCalificaciones: devuelve un Buffer con cabecera %PDF', async () => {
    const { service } = dobleReportes({ alumnoCalificaciones: alumnoBase });
    const pdf = await service.reporteCalificaciones(1);
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('reporteAsistencia: devuelve un Buffer con cabecera %PDF y arma el where de fechas', async () => {
    const { service, consultasAsistencia } = dobleReportes({
      alumnoInscripciones: alumnoBase,
      asistencias: [
        {
          fecha: new Date(Date.UTC(2026, 6, 1)),
          estado: 'presente',
          observacion: null,
        },
        {
          fecha: new Date(Date.UTC(2026, 6, 2)),
          estado: 'ausente',
          observacion: null,
        },
      ],
    });
    const pdf = await service.reporteAsistencia(1, '2026-07-01', '2026-07-31');
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(consultasAsistencia).toHaveLength(1);
    const where = consultasAsistencia[0] as {
      fecha: { gte: Date; lte: Date };
    };
    expect(where.fecha.gte).toBeInstanceOf(Date);
    expect(where.fecha.lte).toBeInstanceOf(Date);
  });

  it('reporteCurso: devuelve un Buffer con cabecera %PDF', async () => {
    const { service } = dobleReportes({ curso: cursoBase });
    const pdf = await service.reporteCurso(1);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
