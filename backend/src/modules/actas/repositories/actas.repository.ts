import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearActaDto } from '../dto/crear-acta.dto';
import type { ActaResponse } from '../dto/acta-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class ActasRepository {
  constructor(private prisma: PrismaService) {}

  async findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<ActaResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.ActaWhereInput = { alumnoId };
    const [rows, total] = await Promise.all([
      this.prisma.acta.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.acta.count({ where }),
    ]);
    const data = rows.map((r) => ({ ...r, fecha: r.fecha.toISOString() }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  create(data: CrearActaDto): Promise<ActaResponse> {
    return this.prisma.acta
      .create({
        data: {
          ...data,
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
        },
      })
      .then((r) => ({ ...r, fecha: r.fecha.toISOString() }));
  }
}
