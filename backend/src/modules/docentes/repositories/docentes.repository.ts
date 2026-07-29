import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearDocenteDto } from '../dto/crear-docente.dto';
import { ActualizarDocenteDto } from '../dto/actualizar-docente.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class DocentesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.docente.findMany({ skip, take: limit, orderBy: { apellido: 'asc' } }),
      this.prisma.docente.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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