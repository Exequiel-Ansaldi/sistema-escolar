import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearAcuerdoDto } from '../dto/crear-acuerdo.dto';
import { ActualizarAcuerdoDto } from '../dto/actualizar-acuerdo.dto';
import type { AcuerdoResponse } from '../dto/acuerdo-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class AcuerdosRepository {
  constructor(private prisma: PrismaService) {}

  async findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AcuerdoResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.AcuerdoWhereInput = { alumnoId };
    const [rows, total] = await Promise.all([
      this.prisma.acuerdo.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.acuerdo.count({ where }),
    ]);
    const data = rows.map((r) => ({ ...r, fecha: r.fecha.toISOString() }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  create(data: CrearAcuerdoDto): Promise<AcuerdoResponse> {
    return this.prisma.acuerdo
      .create({
        data: {
          ...data,
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
        },
      })
      .then((r) => ({ ...r, fecha: r.fecha.toISOString() }));
  }

  update(id: number, data: ActualizarAcuerdoDto): Promise<AcuerdoResponse> {
    return this.prisma.acuerdo
      .update({
        where: { id },
        data: { ...data, fecha: data.fecha ? new Date(data.fecha) : undefined },
      })
      .then((r) => ({ ...r, fecha: r.fecha.toISOString() }));
  }
}
