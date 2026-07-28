import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LicenciasRepository {
  constructor(private prisma: PrismaService) {}

  findManyByDocente(docenteId: number) {
    return this.prisma.licencia.findMany({
      where: { docenteId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.licencia.findUnique({ where: { id } });
  }

  create(data: { docenteId: number; fechaInicio: Date; fechaFin: Date; motivo: string; estado?: string; observacion?: string }) {
    return this.prisma.licencia.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.licencia.update({ where: { id }, data });
  }

  updateMany(args: { where: any; data: any }) {
    return this.prisma.licencia.updateMany(args);
  }

  delete(id: number) {
    return this.prisma.licencia.delete({ where: { id } });
  }
}
