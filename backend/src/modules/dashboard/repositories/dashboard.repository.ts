import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  countAlumnosActivos() {
    return this.prisma.alumno.count({ where: { estado: 'activo' } });
  }
  countDocentesActivos() {
    return this.prisma.docente.count({ where: { estado: 'activo' } });
  }
  countCursosActivos() {
    return this.prisma.curso.count({ where: { estado: 'activo' } });
  }
  countUsuariosActivos() {
    return this.prisma.usuario.count({ where: { activo: true } });
  }

  findAsistenciasByFecha(start: Date, end: Date) {
    return this.prisma.asistencia.findMany({
      where: { fecha: { gte: start, lt: end } },
    });
  }

  countInscripcionesActivas() {
    return this.prisma.inscripcion.count({ where: { estado: 'activo' } });
  }

  aggregateModulos() {
    return this.prisma.moduloMensual.aggregate({
      _sum: { modulosPrevistos: true, modulosDictados: true },
    });
  }

  modulosPorMateria() {
    const now = new Date();
    const inicioMes = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const inicioMesSiguiente = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    return this.prisma.moduloMensual.groupBy({
      by: ['materiaId'],
      where: { mes: { gte: inicioMes, lt: inicioMesSiguiente } },
      _sum: { modulosPrevistos: true, modulosDictados: true },
      orderBy: { materiaId: 'asc' },
    });
  }

  modulosPorFactor() {
    const now = new Date();
    const inicioMes = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const inicioMesSiguiente = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    return this.prisma.moduloNoDictado.groupBy({
      by: ['factor'],
      where: {
        moduloMensual: { mes: { gte: inicioMes, lt: inicioMesSiguiente } },
      },
      _sum: { cantidad: true },
      _count: true,
      orderBy: { factor: 'asc' },
    });
  }

  findCursosConInscripciones() {
    return this.prisma.curso.findMany({
      where: { estado: 'activo' },
      include: { _count: { select: { inscripciones: true } } },
      orderBy: [{ anio: 'asc' }, { division: 'asc' }],
    });
  }

  findUltimasAsistencias(limite: number) {
    return this.prisma.asistencia.findMany({
      take: limite,
      orderBy: { fecha: 'desc' },
      include: {
        alumno: { select: { nombre: true, apellido: true, dni: true } },
      },
    });
  }

  findMaterias() {
    return this.prisma.materia.findMany({ select: { id: true, nombre: true } });
  }

  aggregateCalificaciones() {
    return this.prisma.calificacion.aggregate({
      _avg: { nota: true },
      _count: true,
      _max: { nota: true },
      _min: { nota: true },
    });
  }
}
