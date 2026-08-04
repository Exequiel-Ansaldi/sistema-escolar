import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearAsistenciaDto } from '../dto/crear-asistencia.dto';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import type {
  AsistenciaResponse,
  AsistenciaCursoResponse,
  AsistenciaBuscarResponse,
} from '../dto/asistencia-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

export type DatosCrearAsistencia = Omit<CrearAsistenciaDto, 'justificada'>;

@Injectable()
export class AsistenciaRepository {
  constructor(private prisma: PrismaService) {}

  async findByAlumno(alumnoId: number): Promise<AsistenciaResponse[]> {
    const rows = await this.prisma.asistencia.findMany({
      where: { alumnoId },
      orderBy: { fecha: 'desc' },
    });
    return rows.map((r) => ({ ...r, fecha: r.fecha.toISOString() }));
  }

  async findByCursoYFecha(
    cursoId: number,
    fecha: string,
  ): Promise<AsistenciaCursoResponse[]> {
    const inicio = new Date(fecha);
    inicio.setUTCHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setUTCHours(23, 59, 59, 999);
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { cursoId, estado: 'activo' },
      include: { alumno: true },
      orderBy: { alumno: { apellido: 'asc' } },
    });
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        alumnoId: { in: inscripciones.map((i) => i.alumnoId) },
        fecha: { gte: inicio, lte: fin },
      },
    });
    return inscripciones.map((insc) => {
      const rec = asistencias.find((a) => a.alumnoId === insc.alumnoId);
      const alumno = {
        ...insc.alumno,
        nacimiento: insc.alumno.nacimiento.toISOString(),
        fechaIngreso: insc.alumno.fechaIngreso.toISOString(),
        fechaEgreso: insc.alumno.fechaEgreso
          ? insc.alumno.fechaEgreso.toISOString()
          : null,
      };
      return {
        id: rec?.id ?? null,
        alumnoId: insc.alumnoId,
        fecha: (rec?.fecha ?? new Date(fecha)).toISOString(),
        estado: rec?.estado ?? 'presente',
        observacion: rec?.observacion ?? null,
        alumno,
      };
    });
  }

  async buscarPorAlumno(
    query: string,
    fecha: string,
    page = 1,
    limit = 10,
    filtros?: { anio?: number; division?: string; turno?: string },
  ): Promise<PaginatedResult<AsistenciaBuscarResponse>> {
    const skip = (page - 1) * limit;
    const inicio = new Date(fecha);
    inicio.setUTCHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setUTCHours(23, 59, 59, 999);
    const whereInscripciones: Prisma.InscripcionWhereInput = {
      estado: 'activo',
      ...(query
        ? {
            alumno: {
              OR: [
                { apellido: { contains: query, mode: 'insensitive' } },
                { nombre: { contains: query, mode: 'insensitive' } },
                ...(/^\d+$/.test(query) ? [{ dni: { contains: query } }] : []),
              ],
            },
          }
        : {}),
      ...(filtros?.anio || filtros?.division || filtros?.turno
        ? {
            curso: {
              estado: 'activo',
              ...(filtros?.anio ? { anio: filtros.anio } : {}),
              ...(filtros?.division ? { division: filtros.division } : {}),
              ...(filtros?.turno ? { turno: filtros.turno } : {}),
            },
          }
        : {}),
    };
    const [inscripciones, total] = await Promise.all([
      this.prisma.inscripcion.findMany({
        where: whereInscripciones,
        include: { alumno: true, curso: true },
        orderBy: { alumno: { apellido: 'asc' } },
        skip,
        take: limit,
      }),
      this.prisma.inscripcion.count({ where: whereInscripciones }),
    ]);
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        alumnoId: { in: inscripciones.map((i) => i.alumnoId) },
        fecha: { gte: inicio, lte: fin },
      },
    });
    return {
      data: inscripciones.map((insc) => {
        const rec = asistencias.find((a) => a.alumnoId === insc.alumnoId);
        const alumno = {
          ...insc.alumno,
          nacimiento: insc.alumno.nacimiento.toISOString(),
          fechaIngreso: insc.alumno.fechaIngreso.toISOString(),
          fechaEgreso: insc.alumno.fechaEgreso
            ? insc.alumno.fechaEgreso.toISOString()
            : null,
        };
        return {
          id: rec?.id ?? null,
          alumnoId: insc.alumnoId,
          fecha: (rec?.fecha ?? new Date(fecha)).toISOString(),
          estado: rec?.estado ?? 'presente',
          observacion: rec?.observacion ?? null,
          alumno,
          curso: insc.curso,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  create(data: DatosCrearAsistencia) {
    return this.prisma.asistencia.create({
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
    });
  }

  createMany(datos: DatosCrearAsistencia[]) {
    return this.prisma.asistencia.createMany({
      data: datos.map((d) => ({
        ...d,
        fecha: d.fecha ? new Date(d.fecha) : new Date(),
      })),
    });
  }

  update(id: number, data: ActualizarAsistenciaDto) {
    return this.prisma.asistencia.update({
      where: { id },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      },
    });
  }
}
