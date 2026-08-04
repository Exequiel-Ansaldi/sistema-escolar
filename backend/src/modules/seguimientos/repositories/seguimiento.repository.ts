import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearSeguimientoDto } from '../dto/crear-seguimiento.dto';
import type { SeguimientoResponse } from '../dto/seguimiento-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class SeguimientoRepository {
  constructor(private prisma: PrismaService) {}

  async findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<SeguimientoResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.SeguimientoWhereInput = { alumnoId };
    const [rows, total] = await Promise.all([
      this.prisma.seguimiento.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.seguimiento.count({ where }),
    ]);
    const data = rows.map((r) => ({ ...r, fecha: r.fecha.toISOString() }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  create(data: CrearSeguimientoDto): Promise<SeguimientoResponse> {
    return this.prisma.seguimiento
      .create({
        data: {
          ...data,
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
        },
      })
      .then((r) => ({ ...r, fecha: r.fecha.toISOString() }));
  }
}
