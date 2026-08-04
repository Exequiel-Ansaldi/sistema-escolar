import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearAlumnoDto } from '../dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from '../dto/actualizar-alumno.dto';
import { Prisma } from '@prisma/client';
import type { AlumnoResponse } from '../dto/alumno-response';
import type { InscripcionResponse } from '../../inscripcion/dto/inscripcion-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type AlumnoConRelaciones = Prisma.AlumnoGetPayload<{
  include: { inscripciones: { include: { curso: true } }; tutores: true };
}>;

function serializarAlumno(alumno: AlumnoConRelaciones): AlumnoResponse {
  const inscripciones: InscripcionResponse[] = (alumno.inscripciones ?? []).map(
    (i) => ({
      id: i.id,
      alumnoId: i.alumnoId,
      cursoId: i.cursoId,
      fechaInscripcion: i.fechaInscripcion.toISOString(),
      estado: i.estado,
      curso: i.curso,
    }),
  );
  return {
    id: alumno.id,
    dni: alumno.dni,
    nombre: alumno.nombre,
    apellido: alumno.apellido,
    nacimiento: alumno.nacimiento.toISOString(),
    direccion: alumno.direccion,
    telefono: alumno.telefono,
    estado: alumno.estado,
    fechaIngreso: alumno.fechaIngreso.toISOString(),
    fechaEgreso: alumno.fechaEgreso ? alumno.fechaEgreso.toISOString() : null,
    inscripciones,
    tutores: (
      alumno as {
        tutores?: {
          id: number;
          alumnoId: number;
          nombre: string;
          apellido: string;
          dni: string;
        }[];
      }
    ).tutores,
  };
}

@Injectable()
export class AlumnosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResult<AlumnoResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.AlumnoWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.alumno.findMany({
        skip,
        take: limit,
        where,
        orderBy: { apellido: 'asc' },
        include: { inscripciones: { include: { curso: true } } },
      }),
      this.prisma.alumno.count({ where }),
    ]);
    const data = rows.map(serializarAlumno);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<AlumnoResponse | null> {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id },
      include: {
        inscripciones: { include: { curso: true } },
        tutores: true,
      },
    });
    return alumno ? serializarAlumno(alumno) : null;
  }

  findByDni(dni: string) {
    return this.prisma.alumno.findUnique({ where: { dni } });
  }

  create(data: CrearAlumnoDto) {
    return this.prisma.alumno.create({
      data: {
        ...data,
        nacimiento: new Date(data.nacimiento),
        fechaIngreso: new Date(data.fechaIngreso),
        fechaEgreso: data.fechaEgreso ? new Date(data.fechaEgreso) : null,
      },
    });
  }

  update(id: number, data: ActualizarAlumnoDto) {
    const updateData: Prisma.AlumnoUpdateInput = { ...data };
    if (data.nacimiento) updateData.nacimiento = new Date(data.nacimiento);
    if (data.fechaIngreso)
      updateData.fechaIngreso = new Date(data.fechaIngreso);
    if (data.fechaEgreso !== undefined) {
      updateData.fechaEgreso = data.fechaEgreso
        ? new Date(data.fechaEgreso)
        : null;
    }
    return this.prisma.alumno.update({ where: { id }, data: updateData });
  }

  disable(id: number) {
    return this.prisma.alumno.update({
      where: { id },
      data: { estado: 'inactivo' },
    });
  }
}
