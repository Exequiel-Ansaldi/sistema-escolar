import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearAsistenciaDto } from '../dto/crear-asistencia.dto';

@Injectable()
export class AsistenciaRepository {
  constructor(private prisma: PrismaService) {}

  findByAlumno(alumnoId: number) {
    return this.prisma.asistencia.findMany({
      where: { alumnoId },
      orderBy: { fecha: 'desc' },
    });
  }

  async findByCursoYFecha(cursoId: number, fecha: string) {
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
        alumnoId: { in: inscripciones.map(i => i.alumnoId) },
        fecha: { gte: inicio, lte: fin },
      },
    });
    return inscripciones.map(insc => {
      const rec = asistencias.find(a => a.alumnoId === insc.alumnoId);
      return {
        id: rec?.id ?? null,
        alumnoId: insc.alumnoId,
        fecha: rec?.fecha ?? new Date(fecha),
        estado: rec?.estado ?? 'presente',
        observacion: rec?.observacion ?? null,
        alumno: insc.alumno,
      };
    });
  }

  async buscarPorAlumno(query: string, fecha: string) {
    const inicio = new Date(fecha);
    inicio.setUTCHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setUTCHours(23, 59, 59, 999);
    const inscripciones: any[] = await this.prisma.inscripcion.findMany({
      where: {
        estado: 'activo',
        ...(query ? {
          alumno: {
            OR: [
              { apellido: { contains: query, mode: 'insensitive' } },
              { nombre: { contains: query, mode: 'insensitive' } },
              ...(/^\d+$/.test(query) ? [{ dni: { contains: query } }] : []),
            ],
          },
        } : {}),
      },
      include: { alumno: true, curso: true },
      orderBy: { alumno: { apellido: 'asc' } },
    });
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        alumnoId: { in: inscripciones.map(i => i.alumnoId) },
        fecha: { gte: inicio, lte: fin },
      },
    });
    return inscripciones.map(insc => {
      const rec = asistencias.find(a => a.alumnoId === insc.alumnoId);
      return {
        id: rec?.id ?? null,
        alumnoId: insc.alumnoId,
        fecha: rec?.fecha ?? new Date(fecha),
        estado: rec?.estado ?? 'presente',
        observacion: rec?.observacion ?? null,
        alumno: insc.alumno,
        curso: insc.curso,
      };
    });
  }

  create(data: CrearAsistenciaDto) {
    return this.prisma.asistencia.create({
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
    });
  }

  createMany(datos: CrearAsistenciaDto[]) {
    return this.prisma.asistencia.createMany({
      data: datos.map((d) => ({
        ...d,
        fecha: d.fecha ? new Date(d.fecha) : new Date(),
      })),
    });
  }

  update(id: number, data: Partial<CrearAsistenciaDto>) {
    return this.prisma.asistencia.update({
      where: { id },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      },
    });
  }
}