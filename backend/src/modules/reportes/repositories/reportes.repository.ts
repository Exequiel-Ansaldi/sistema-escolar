import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportesRepository {
  constructor(private prisma: PrismaService) {}

  async findAlumnoWithCalificaciones(alumnoId: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        persona: true,
        calificaciones: {
          include: { materia: true },
          orderBy: [{ trimestre: 'asc' }, { materia: { nombre: 'asc' } }],
        },
        inscripciones: {
          include: { curso: true },
          where: { estado: 'activo' },
        },
      },
    });
    if (!alumno) return null;
    const { persona, ...resto } = alumno;
    return {
      ...resto,
      dni: persona.dni ?? '',
      nombre: persona.nombre,
      apellido: persona.apellido,
    };
  }

  async findAlumnoWithInscripciones(alumnoId: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        persona: true,
        inscripciones: {
          include: { curso: true },
          where: { estado: 'activo' },
        },
      },
    });
    if (!alumno) return null;
    const { persona, ...resto } = alumno;
    return {
      ...resto,
      dni: persona.dni ?? '',
      nombre: persona.nombre,
      apellido: persona.apellido,
    };
  }

  findAsistencias(alumnoId: number, where?: Prisma.AsistenciaWhereInput) {
    return this.prisma.asistencia.findMany({
      where: { alumnoId, ...where },
      orderBy: { fecha: 'desc' },
    });
  }

  async findCursoWithAll(cursoId: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        inscripciones: {
          include: {
            alumno: { include: { persona: true } },
          },
          where: { estado: 'activo' },
        },
        materias: {
          include: { materia: { select: { nombre: true } } },
        },
        modulosMensuales: {
          include: { materia: { select: { nombre: true } }, noDictados: true },
          orderBy: { mes: 'desc' },
          take: 20,
        },
      },
    });
    if (!curso) return null;
    const { inscripciones, ...resto } = curso;
    return {
      ...resto,
      inscripciones: inscripciones.map(({ alumno, ...insc }) => ({
        ...insc,
        alumno: {
          id: alumno.id,
          dni: alumno.persona.dni ?? '',
          nombre: alumno.persona.nombre,
          apellido: alumno.persona.apellido,
        },
      })),
    };
  }
}
