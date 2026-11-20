import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { ReportesRepository } from './repositories/reportes.repository';

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

class ReportesRepositoryMock {
  static alumnoCalificaciones: AlumnoMini | null = null;
  static alumnoInscripciones: AlumnoMini | null = null;
  static asistencias: {
    fecha: Date;
    estado: string;
    justificacion?: string | null;
    observacion?: string | null;
  }[] = [];
  static curso: {
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
  } | null = null;
  static consultasAsistencia: unknown[] = [];

  async findAlumnoWithCalificaciones() {
    return ReportesRepositoryMock.alumnoCalificaciones;
  }
  async findAlumnoWithInscripciones() {
    return ReportesRepositoryMock.alumnoInscripciones;
  }
  async findAsistencias(_alumnoId: number, where: unknown) {
    ReportesRepositoryMock.consultasAsistencia.push(where);
    return ReportesRepositoryMock.asistencias;
  }
  async findCursoWithAll() {
    return ReportesRepositoryMock.curso;
  }
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

describe('ReportesService (PDF)', () => {
  let service: ReportesService;

  beforeEach(async () => {
    ReportesRepositoryMock.alumnoCalificaciones = null;
    ReportesRepositoryMock.alumnoInscripciones = null;
    ReportesRepositoryMock.asistencias = [];
    ReportesRepositoryMock.curso = null;
    ReportesRepositoryMock.consultasAsistencia = [];
    const module = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: ReportesRepository, useClass: ReportesRepositoryMock },
      ],
    }).compile();
    service = module.get(ReportesService);
  });

  it.each([
    ['reporteCalificaciones', 99, 'Alumno no encontrado'],
    ['reporteAsistencia', 99, 'Alumno no encontrado'],
    ['reporteCurso', 99, 'Curso no encontrado'],
  ] as const)('%s de recurso inexistente → 404', async (metodo, id, mensaje) => {
    await expect((service as any)[metodo](id)).rejects.toThrow(
      new NotFoundException(mensaje),
    );
  });

  it('reporteCalificaciones devuelve un Buffer con cabecera %PDF', async () => {
    ReportesRepositoryMock.alumnoCalificaciones = alumnoBase;
    const pdf = await service.reporteCalificaciones(1);
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('reporteAsistencia devuelve %PDF y arma el where de fechas', async () => {
    ReportesRepositoryMock.alumnoInscripciones = alumnoBase;
    ReportesRepositoryMock.asistencias = [
      { fecha: new Date(Date.UTC(2026, 6, 1)), estado: 'presente', observacion: null },
      { fecha: new Date(Date.UTC(2026, 6, 2)), estado: 'ausente', observacion: null },
    ];
    const pdf = await service.reporteAsistencia(1, '2026-07-01', '2026-07-31');
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(ReportesRepositoryMock.consultasAsistencia).toHaveLength(1);
    const where = ReportesRepositoryMock.consultasAsistencia[0] as {
      fecha: { gte: Date; lte: Date };
    };
    expect(where.fecha.gte).toBeInstanceOf(Date);
    expect(where.fecha.lte).toBeInstanceOf(Date);
  });

  it('reporteCurso devuelve un Buffer con cabecera %PDF', async () => {
    ReportesRepositoryMock.curso = {
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
    const pdf = await service.reporteCurso(1);
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
