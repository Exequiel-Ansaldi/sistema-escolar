import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearInscripcionDto } from '../dto/crear-inscripcion.dto';
import { Prisma } from '@prisma/client';
import type { InscripcionResponse } from '../dto/inscripcion-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type InscripcionConRelaciones = Prisma.InscripcionGetPayload<{
  include: { alumno: true; curso: true };
}>;

function serializarInscripcion(
  insc: InscripcionConRelaciones,
): InscripcionResponse {
  return {
    id: insc.id,
    alumnoId: insc.alumnoId,
    cursoId: insc.cursoId,
    fechaInscripcion: insc.fechaInscripcion.toISOString(),
    estado: insc.estado,
    alumno: {
      id: insc.alumno.id,
      dni: insc.alumno.dni,
      nombre: insc.alumno.nombre,
      apellido: insc.alumno.apellido,
      nacimiento: insc.alumno.nacimiento.toISOString(),
      direccion: insc.alumno.direccion,
      telefono: insc.alumno.telefono,
      estado: insc.alumno.estado,
      fechaIngreso: insc.alumno.fechaIngreso.toISOString(),
      fechaEgreso: insc.alumno.fechaEgreso
        ? insc.alumno.fechaEgreso.toISOString()
        : null,
    },
    curso: insc.curso,
  };
}

@Injectable()
export class InscripcionRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    filtros?: { anio?: number; division?: string; turno?: string },
  ): Promise<PaginatedResult<InscripcionResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.InscripcionWhereInput =
      filtros?.anio || filtros?.division || filtros?.turno
        ? {
            curso: {
              estado: 'activo',
              ...(filtros?.anio ? { anio: filtros.anio } : {}),
              ...(filtros?.division ? { division: filtros.division } : {}),
              ...(filtros?.turno ? { turno: filtros.turno } : {}),
            },
          }
        : {};
    const [rows, total] = await Promise.all([
      this.prisma.inscripcion.findMany({
        where,
        skip,
        take: limit,
        include: {
          alumno: true,
          curso: true,
        },
        orderBy: { fechaInscripcion: 'desc' },
      }),
      this.prisma.inscripcion.count({ where }),
    ]);
    const data = rows.map(serializarInscripcion);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findByAlumnoYCurso(alumnoId: number, cursoId: number) {
    return this.prisma.inscripcion.findUnique({
      where: { alumnoId_cursoId: { alumnoId, cursoId } },
    });
  }

  create(data: CrearInscripcionDto) {
    return this.prisma.inscripcion.create({ data });
  }

  delete(alumnoId: number, cursoId: number) {
    return this.prisma.inscripcion.delete({
      where: { alumnoId_cursoId: { alumnoId, cursoId } },
    });
  }
}
