import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearDiaSinClasesDto } from '../dto/crear-dia-sin-clases.dto';
import type { DiaSinClasesResponse } from '../dto/dia-sin-clases-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class DiasSinClasesRepository {
  constructor(private prisma: PrismaService) {}

  async find(
    desde?: Date,
    hasta?: Date,
    cursoId?: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<DiaSinClasesResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.DiaSinClasesWhereInput = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = desde;
      if (hasta) where.fecha.lte = hasta;
    }
    if (cursoId) where.cursoId = cursoId;
    const [rows, total] = await Promise.all([
      this.prisma.diaSinClases.findMany({
        where,
        include: {
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
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.diaSinClases.count({ where }),
    ]);
    const data = rows.map((r) => ({
      ...r,
      fecha: r.fecha.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  create(dto: CrearDiaSinClasesDto) {
    return this.prisma.diaSinClases.create({
      data: {
        fecha: new Date(dto.fecha),
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        cursoId: dto.cursoId ?? null,
      },
    });
  }

  delete(id: number) {
    return this.prisma.diaSinClases.delete({ where: { id } });
  }

  findEntreFechas(desde: Date, hasta: Date) {
    return this.prisma.diaSinClases.findMany({
      where: { fecha: { gte: desde, lt: hasta } },
    });
  }
}
