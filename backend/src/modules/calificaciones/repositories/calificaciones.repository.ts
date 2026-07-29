import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearCalificacionDto } from '../dto/crear-calificacion.dto';

@Injectable()
export class CalificacionesRepository {
  constructor(private prisma: PrismaService) {}

  findByAlumno(alumnoId: number) {
    return this.prisma.calificacion.findMany({
      where: { alumnoId },
      include: { materia: true },
      orderBy: [{ trimestre: 'asc' }, { materia: { nombre: 'asc' } }],
    });
  }

  findByAlumnoYMateria(alumnoId: number, materiaId: number) {
    return this.prisma.calificacion.findMany({
      where: { alumnoId, materiaId },
      orderBy: { trimestre: 'asc' },
    });
  }

  promedioAlumno(alumnoId: number) {
    return this.prisma.calificacion.aggregate({
      where: { alumnoId },
      _avg: { nota: true },
      _count: true,
    });
  }

  promedioPorTrimestre(alumnoId: number) {
    return this.prisma.calificacion.groupBy({
      by: ['trimestre'],
      where: { alumnoId },
      _avg: { nota: true },
      _count: true,
      orderBy: { trimestre: 'asc' },
    });
  }

  promedioPorMateria(alumnoId: number) {
    return this.prisma.calificacion.groupBy({
      by: ['materiaId'],
      where: { alumnoId },
      _avg: { nota: true },
      _count: true,
    });
  }

  findById(id: number) {
    return this.prisma.calificacion.findUnique({ where: { id } });
  }

  create(data: CrearCalificacionDto) {
    return this.prisma.calificacion.create({
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
      include: { materia: true },
    });
  }

  update(id: number, data: Partial<CrearCalificacionDto>) {
    return this.prisma.calificacion.update({ where: { id }, data });
  }
}