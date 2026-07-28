import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearDiaSinClasesDto } from '../dto/crear-dia-sin-clases.dto';

@Injectable()
export class DiasSinClasesRepository {
  constructor(private prisma: PrismaService) {}

  find(desde?: Date, hasta?: Date, cursoId?: number) {
    const where: any = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = desde;
      if (hasta) where.fecha.lte = hasta;
    }
    if (cursoId) where.cursoId = cursoId;
    return this.prisma.diaSinClases.findMany({
      where,
      include: { curso: { select: { id: true, anio: true, division: true, turno: true, orientacion: true } } },
      orderBy: { fecha: 'desc' },
    });
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
