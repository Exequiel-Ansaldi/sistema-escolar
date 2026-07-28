import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModulosSemanaRepository {
  constructor(private prisma: PrismaService) {}

  findByMes(mes: string) {
    const start = new Date(mes + '-01');
    const [y, m] = mes.split('-').map(Number);
    const end = new Date(y, m, 1);

    return this.prisma.moduloSemanal.findMany({
      where: { semanaInicio: { gte: start, lt: end } },
      include: { docente: true, materia: true, curso: true },
      orderBy: { semanaInicio: 'desc' },
    });
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
