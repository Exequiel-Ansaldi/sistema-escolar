import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ModulosSemanaRepository {
  constructor(private prisma: PrismaService) {}

  async findByMes(mes: string, page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const start = new Date(mes + '-01');
    const [y, m] = mes.split('-').map(Number);
    const end = new Date(y, m, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.moduloSemanal.findMany({
        where: { semanaInicio: { gte: start, lt: end } },
        include: { docente: true, materia: true, curso: true },
        orderBy: { semanaInicio: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.moduloSemanal.count({
        where: { semanaInicio: { gte: start, lt: end } },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.prisma.moduloSemanal.findUnique({ where: { id } });
  }

  upsert(data: {
    docenteId: number; cursoId: number; materiaId: number; semanaInicio: Date;
    modulosPrevistos: number; modulosDictados: number; factor?: string; observacion?: string;
  }) {
    return this.prisma.moduloSemanal.upsert({
      where: {
        cursoId_materiaId_docenteId_semanaInicio: {
          cursoId: data.cursoId, materiaId: data.materiaId,
          docenteId: data.docenteId, semanaInicio: data.semanaInicio,
        },
      },
      update: { modulosPrevistos: data.modulosPrevistos, modulosDictados: data.modulosDictados, factor: data.factor, observacion: data.observacion },
      create: data,
    });
  }

  delete(id: number) {
    return this.prisma.moduloSemanal.delete({ where: { id } });
  }
}
