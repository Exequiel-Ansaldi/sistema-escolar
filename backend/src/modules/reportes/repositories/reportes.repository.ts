import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportesRepository {
  constructor(private prisma: PrismaService) {}

  findAlumnoWithCalificaciones(alumnoId: number) {
    return this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
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
  }

  findAlumnoWithInscripciones(alumnoId: number) {
    return this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: {
          include: { curso: true },
          where: { estado: 'activo' },
        },
      },
    });
  }

  findAsistencias(alumnoId: number, where?: Prisma.AsistenciaWhereInput) {
    return this.prisma.asistencia.findMany({
      where: { alumnoId, ...where },
      orderBy: { fecha: 'desc' },
    });
  }

  findCursoWithAll(cursoId: number) {
    return this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        inscripciones: {
          include: {
            alumno: { select: { nombre: true, apellido: true, dni: true } },
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
  }
}
