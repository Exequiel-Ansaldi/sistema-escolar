import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { CrearMateriaDto } from '../dto/crear-materia.dto';
import { ActualizarMateriaDto } from '../dto/actualizar-materia.dto';

@Injectable()
export class MateriasRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.materia.findMany({ skip, take: limit, orderBy: { nombre: 'asc' } }),
      this.prisma.materia.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number) {
    return this.prisma.materia.findUnique({ where: { id }, include: { docentes: { include: { docente: true } } } });
  }

  findByNombre(nombre: string) {
    return this.prisma.materia.findFirst({ where: { nombre: { equals: nombre, mode: 'insensitive' } } });
  }

  create(data: CrearMateriaDto) { return this.prisma.materia.create({ data }); }
  update(id: number, data: ActualizarMateriaDto) { return this.prisma.materia.update({ where: { id }, data }); }
  delete(id: number) { return this.prisma.materia.delete({ where: { id } }); }
}