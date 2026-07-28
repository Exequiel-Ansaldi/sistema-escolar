import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportesRepository {
  constructor(private prisma: PrismaService) {}

  findAlumnoWithCalificaciones(alumnoId: number) {
    return this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        calificaciones: { include: { materia: true }, orderBy: [{ trimestre: 'asc' }, { materia: { nombre: 'asc' } }] },
        inscripciones: { include: { curso: true }, where: { estado: 'activo' } },
      },
    });
  }

  findAlumnoWithInscripciones(alumnoId: number) {
    return this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        inscripciones: { include: { curso: true }, where: { estado: 'activo' } },
      },
    });
  }

  findAsistencias(alumnoId: number, where?: any) {
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
          include: { alumno: { select: { nombre: true, apellido: true, dni: true } } },
          where: { estado: 'activo' },
        },
        materias: {
          include: { materia: { select: { nombre: true } } },
        },
        modulosSemanales: {
          include: { materia: { select: { nombre: true } } },
          orderBy: { semanaInicio: 'desc' },
          take: 20,
        },
      },
    });
  }
}
