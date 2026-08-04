import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActualizarLicenciaDto } from '../dto/actualizar-licencia.dto';
import type { LicenciaResponse } from '../dto/licencia-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class LicenciasRepository {
  constructor(private prisma: PrismaService) {}

  async findManyByDocente(
    docenteId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<LicenciaResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.LicenciaWhereInput = { docenteId };
    const [rows, total] = await Promise.all([
      this.prisma.licencia.findMany({
        where,
        orderBy: { fechaInicio: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.licencia.count({ where }),
    ]);
    const data = rows.map((r) => ({
      ...r,
      fechaInicio: r.fechaInicio.toISOString(),
      fechaFin: r.fechaFin.toISOString(),
    }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.prisma.licencia.findUnique({ where: { id } });
  }

  create(data: {
    docenteId: number;
    fechaInicio: Date;
    fechaFin: Date;
    codigo?: string;
    motivo: string;
    estado?: string;
    observacion?: string;
  }) {
    return this.prisma.licencia.create({ data });
  }

  update(id: number, data: ActualizarLicenciaDto) {
    return this.prisma.licencia.update({
      where: { id },
      data: {
        ...data,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      },
    });
  }

  updateMany(args: {
    where: Prisma.LicenciaWhereInput;
    data: Prisma.LicenciaUpdateManyMutationInput;
  }) {
    return this.prisma.licencia.updateMany(args);
  }

  delete(id: number) {
    return this.prisma.licencia.delete({ where: { id } });
  }
}
