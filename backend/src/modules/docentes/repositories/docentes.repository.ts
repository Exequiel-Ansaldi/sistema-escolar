import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearDocenteDto } from '../dto/crear-docente.dto';
import { ActualizarDocenteDto } from '../dto/actualizar-docente.dto';

@Injectable()
export class DocentesRepository {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.docente.findMany({ orderBy: { apellido: 'asc' } });
  }

  findById(id: number) {
    return this.prisma.docente.findUnique({
      where: { id },
      include: { materias: { include: { materia: true } }, licencias: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.docente.findUnique({ where: { email } });
  }

  findByDni(dni: string) {
    return this.prisma.docente.findUnique({ where: { dni } });
  }

  create(data: CrearDocenteDto) {
    return this.prisma.docente.create({
      data: { ...data, fechaIngreso: new Date(data.fechaIngreso) },
    });
  }

  update(id: number, data: ActualizarDocenteDto) {
    const updateData: any = { ...data };
    if (data.fechaIngreso) updateData.fechaIngreso = new Date(data.fechaIngreso);
    return this.prisma.docente.update({ where: { id }, data: updateData });
  }

  disable(id: number) {
    return this.prisma.docente.update({ where: { id }, data: { estado: 'inactivo' } });
  }
}