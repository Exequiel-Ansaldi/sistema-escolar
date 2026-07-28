import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ActasRepository {
  constructor(private prisma: PrismaService) {}
  findByAlumno(alumnoId: number) {
    return this.prisma.acta.findMany({ where: { alumnoId }, orderBy: { fecha: 'desc' } });
  }
  create(data: any) {
    return this.prisma.acta.create({ data: { ...data, fecha: data.fecha ? new Date(data.fecha) : new Date() } });
  }
}

@Injectable()
export class AcuerdosRepository {
  constructor(private prisma: PrismaService) {}
  findByAlumno(alumnoId: number) {
    return this.prisma.acuerdo.findMany({ where: { alumnoId }, orderBy: { fecha: 'desc' } });
  }
  create(data: any) {
    return this.prisma.acuerdo.create({ data: { ...data, fecha: data.fecha ? new Date(data.fecha) : new Date() } });
  }
  update(id: number, data: any) { return this.prisma.acuerdo.update({ where: { id }, data }); }
}

@Injectable()
export class SeguimientoRepository {
  constructor(private prisma: PrismaService) {}
  findByAlumno(alumnoId: number) {
    return this.prisma.seguimiento.findMany({ where: { alumnoId }, orderBy: { fecha: 'desc' } });
  }
  create(data: any) {
    return this.prisma.seguimiento.create({ data: { ...data, fecha: data.fecha ? new Date(data.fecha) : new Date() } });
  }
}

@Injectable()
export class TutoresRepository {
  constructor(private prisma: PrismaService) {}
  findByAlumno(alumnoId: number) { return this.prisma.tutor.findMany({ where: { alumnoId } }); }
  create(data: any) { return this.prisma.tutor.create({ data }); }
  delete(id: number) { return this.prisma.tutor.delete({ where: { id } }); }
}