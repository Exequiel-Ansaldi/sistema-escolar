import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  ModuloSemanalResponse,
  ModulosSemanaMesResponse,
} from '../dto/modulo-semana-response';

@Injectable()
export class ModulosSemanaRepository {
  constructor(private prisma: PrismaService) {}

  async findByMes(
    mes: string,
    page = 1,
    limit = 10,
    filtros?: {
      anio?: number;
      division?: string;
      turno?: string;
      materiaId?: number;
    },
  ): Promise<ModulosSemanaMesResponse> {
    const start = new Date(mes + '-01');
    const [y, m] = mes.split('-').map(Number);
    const end = new Date(y, m, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.ModuloSemanalWhereInput = {
      semanaInicio: { gte: start, lt: end },
    };
    if (filtros?.materiaId) where.materiaId = filtros.materiaId;
    if (filtros?.anio || filtros?.division || filtros?.turno) {
      const curso: Prisma.CursoWhereInput = { estado: 'activo' };
      if (filtros?.anio) curso.anio = filtros.anio;
      if (filtros?.division) curso.division = filtros.division;
      if (filtros?.turno) curso.turno = filtros.turno;
      where.curso = curso;
    }

    const [rows, total, totals] = await Promise.all([
      this.prisma.moduloSemanal.findMany({
        where,
        include: { docente: true, materia: true, curso: true },
        orderBy: { semanaInicio: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.moduloSemanal.count({ where }),
      this.prisma.moduloSemanal.aggregate({
        where,
        _sum: { modulosPrevistos: true, modulosDictados: true },
      }),
    ]);

    const data = rows.map((r) => ({
      ...r,
      semanaInicio: r.semanaInicio.toISOString(),
      docente: r.docente
        ? { ...r.docente, fechaIngreso: r.docente.fechaIngreso.toISOString() }
        : r.docente,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPrevistos: totals._sum.modulosPrevistos ?? 0,
      totalDictados: totals._sum.modulosDictados ?? 0,
    };
  }

  async findById(id: number): Promise<ModuloSemanalResponse | null> {
    const r = await this.prisma.moduloSemanal.findUnique({ where: { id } });
    return r ? { ...r, semanaInicio: r.semanaInicio.toISOString() } : null;
  }

  upsert(data: {
    docenteId: number;
    cursoId: number;
    materiaId: number;
    semanaInicio: Date;
    modulosPrevistos: number;
    modulosDictados: number;
    factor?: string;
    observacion?: string;
  }): Promise<ModuloSemanalResponse> {
    return this.prisma.moduloSemanal
      .upsert({
        where: {
          cursoId_materiaId_docenteId_semanaInicio: {
            cursoId: data.cursoId,
            materiaId: data.materiaId,
            docenteId: data.docenteId,
            semanaInicio: data.semanaInicio,
          },
        },
        update: {
          modulosPrevistos: data.modulosPrevistos,
          modulosDictados: data.modulosDictados,
          factor: data.factor,
          observacion: data.observacion,
        },
        create: data,
      })
      .then((r) => ({ ...r, semanaInicio: r.semanaInicio.toISOString() }));
  }

  delete(id: number) {
    return this.prisma.moduloSemanal.delete({ where: { id } });
  }
}
