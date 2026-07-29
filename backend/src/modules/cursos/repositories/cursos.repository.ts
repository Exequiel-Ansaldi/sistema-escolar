import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearCursoDto } from '../dto/crear-curso.dto';
import { ActualizarCursoDto } from '../dto/actualizar-curso.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class CursosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    filters?: { anio?: number; division?: string; turno?: string },
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    const where: Prisma.CursoWhereInput = {};
    if (filters?.anio) where.anio = filters.anio;
    if (filters?.division) where.division = filters.division;
    if (filters?.turno) where.turno = filters.turno;
    const [data, total] = await Promise.all([
      this.prisma.curso.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ anio: 'asc' }, { division: 'asc' }],
      }),
      this.prisma.curso.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.prisma.curso.findUnique({
      where: { id },
      include: {
        inscripciones: {
          include: { alumno: true },
          where: { estado: 'activo' },
        },
        materias: {
          include: { materia: true },
        },
      },
    });
  }

  findByAnioDivisionTurno(anio: number, division: string, turno: string) {
    return this.prisma.curso.findFirst({ where: { anio, division, turno, estado: 'activo' } });
  }

  create(data: CrearCursoDto) {
    return this.prisma.curso.create({ data });
  }

  update(id: number, data: ActualizarCursoDto) {
    return this.prisma.curso.update({ where: { id }, data });
  }

  disable(id: number) {
    return this.prisma.curso.update({ where: { id }, data: { estado: 'inactivo' } });
  }
}