import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearAlumnoDto } from '../dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from '../dto/actualizar-alumno.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class AlumnosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.alumno.findMany({
        skip,
        take: limit,
        orderBy: { apellido: 'asc' },
        include: { inscripciones: { include: { curso: true } } },
      }),
      this.prisma.alumno.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.prisma.alumno.findUnique({
      where: { id },
      include: {
        inscripciones: { include: { curso: true } },
        tutores: true,
      },
    });
  }

  findByDni(dni: string) {
    return this.prisma.alumno.findUnique({ where: { dni } });
  }

  search(termino: string) {
    return this.prisma.alumno.findMany({
      where: {
        OR: [
          { nombre: { contains: termino, mode: 'insensitive' } },
          { apellido: { contains: termino, mode: 'insensitive' } },
          { dni: { contains: termino } },
        ],
      },
      orderBy: { apellido: 'asc' },
    });
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
    const updateData: any = { ...data };
    if (data.nacimiento) updateData.nacimiento = new Date(data.nacimiento);
    if (data.fechaIngreso) updateData.fechaIngreso = new Date(data.fechaIngreso);
    if (data.fechaEgreso !== undefined) {
      updateData.fechaEgreso = data.fechaEgreso ? new Date(data.fechaEgreso) : null;
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