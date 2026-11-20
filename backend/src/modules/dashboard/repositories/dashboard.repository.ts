import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  countAlumnosActivos() {
    return this.prisma.alumno.count({ where: { persona: { estado: 'activo' } } });
  }
  countDocentesActivos() {
    return this.prisma.docente.count({ where: { persona: { estado: 'activo' } } });
  }
  countCursosActivos() {
    return this.prisma.curso.count({ where: { estado: 'activo' } });
  }
  countUsuariosActivos() {
    return this.prisma.personal.count({ where: { activo: true } });
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

  findInscripcionesActivasConCurso() {
    return this.prisma.inscripcion.findMany({
      where: { estado: 'activo' },
      select: {
        alumnoId: true,
        curso: {
          select: {
            id: true,
            anio: true,
            division: true,
            turno: true,
            orientacion: true,
          },
        },
      },
    });
  }

  calificacionesPromedioPorAlumnoMateria() {
    return this.prisma.calificacion.groupBy({
      by: ['alumnoId', 'materiaId'],
      _avg: { nota: true },
    });
  }

  async findUltimasAsistencias(limite: number) {
    const rows = await this.prisma.asistencia.findMany({
      take: limite,
      orderBy: { fecha: 'desc' },
      include: { alumno: { include: { persona: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      alumnoId: r.alumnoId,
      fecha: r.fecha.toISOString(),
      estado: r.estado,
      justificacion: r.justificacion,
      observacion: r.observacion,
      alumno: {
        nombre: r.alumno.persona.nombre,
        apellido: r.alumno.persona.apellido,
        dni: r.alumno.persona.dni ?? '',
      },
    }));
  }

  findMaterias() {
    return this.prisma.materia.findMany({ select: { id: true, nombre: true } });
  }
}
