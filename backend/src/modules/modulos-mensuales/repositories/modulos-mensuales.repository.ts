import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  ModuloMensualResponse,
  ModulosMensualesMesResponse,
} from '../dto/modulo-mensual-response';

@Injectable()
export class ModulosMensualesRepository {
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
  ): Promise<ModulosMensualesMesResponse> {
    const [y, m] = mes.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));
    const skip = (page - 1) * limit;

    const where: Prisma.ModuloMensualWhereInput = {
      mes: { gte: start, lt: end },
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
      this.prisma.moduloMensual.findMany({
        where,
        include: {
          docente: true,
          materia: true,
          curso: true,
          noDictados: true,
        },
        orderBy: { mes: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.moduloMensual.count({ where }),
      this.prisma.moduloMensual.aggregate({
        where,
        _sum: { modulosPrevistos: true, modulosDictados: true },
      }),
    ]);

    const data = rows.map((r) => ({
      ...r,
      mes: r.mes.toISOString(),
      docente: r.docente
        ? { ...r.docente, fechaIngreso: r.docente.fechaIngreso.toISOString() }
        : r.docente,
      noDictados: r.noDictados ?? undefined,
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

  async findById(id: number): Promise<ModuloMensualResponse | null> {
    const r = await this.prisma.moduloMensual.findUnique({
      where: { id },
      include: { noDictados: true },
    });
    return r ? { ...r, mes: r.mes.toISOString() } : null;
  }

  async upsert(data: {
    docenteId: number;
    cursoId: number;
    materiaId: number;
    mes: Date;
    modulosPrevistos: number;
    modulosDictados: number;
    noDictados?: { factor: string; cantidad: number; observacion?: string }[];
    observacion?: string;
  }): Promise<ModuloMensualResponse> {
    const { noDictados, ...resto } = data;
    return this.prisma.$transaction(async (tx) => {
      const r = await tx.moduloMensual.upsert({
        where: {
          cursoId_materiaId_docenteId_mes: {
            cursoId: resto.cursoId,
            materiaId: resto.materiaId,
            docenteId: resto.docenteId,
            mes: resto.mes,
          },
        },
        update: {
          modulosPrevistos: resto.modulosPrevistos,
          modulosDictados: resto.modulosDictados,
          observacion: resto.observacion,
        },
        create: resto,
      });
      if (noDictados !== undefined) {
        await tx.moduloNoDictado.deleteMany({
          where: { moduloMensualId: r.id },
        });
        if (noDictados.length) {
          await tx.moduloNoDictado.createMany({
            data: noDictados.map((n) => ({ ...n, moduloMensualId: r.id })),
          });
        }
      }
      return { ...r, mes: r.mes.toISOString() };
    });
  }

  async update(
    id: number,
    data: {
      modulosPrevistos?: number;
      modulosDictados?: number;
      noDictados?: { factor: string; cantidad: number; observacion?: string }[];
      observacion?: string | null;
    },
  ): Promise<ModuloMensualResponse> {
    const { noDictados, ...resto } = data;
    return this.prisma.$transaction(async (tx) => {
      const r = await tx.moduloMensual.update({ where: { id }, data: resto });
      if (noDictados !== undefined) {
        await tx.moduloNoDictado.deleteMany({
          where: { moduloMensualId: r.id },
        });
        if (noDictados.length) {
          await tx.moduloNoDictado.createMany({
            data: noDictados.map((n) => ({ ...n, moduloMensualId: r.id })),
          });
        }
      }
      return { ...r, mes: r.mes.toISOString() };
    });
  }

  delete(id: number) {
    return this.prisma.moduloMensual.delete({ where: { id } });
  }
}
