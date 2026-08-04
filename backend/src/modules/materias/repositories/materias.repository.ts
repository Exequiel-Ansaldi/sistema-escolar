import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { CrearMateriaDto } from '../dto/crear-materia.dto';
import { ActualizarMateriaDto } from '../dto/actualizar-materia.dto';
import { Prisma } from '@prisma/client';
import type {
  MateriaResponse,
  MateriaDetalleResponse,
} from '../dto/materia-response';

@Injectable()
export class MateriasRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResult<MateriaResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.MateriaWhereInput = search
      ? { nombre: { contains: search, mode: 'insensitive' } }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.materia.findMany({
        skip,
        take: limit,
        where,
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.materia.count({ where }),
    ]);
    const data = rows.map((m) => ({ id: m.id, nombre: m.nombre }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<MateriaDetalleResponse | null> {
    const materia = await this.prisma.materia.findUnique({
      where: { id },
      include: { docentes: { include: { docente: true } } },
    });
    if (!materia) return null;
    const docentes = (materia.docentes ?? []).map((dm) => ({
      docenteId: dm.docenteId,
      materiaId: dm.materiaId,
      docente: dm.docente
        ? {
            id: dm.docente.id,
            dni: dm.docente.dni,
            nombre: dm.docente.nombre,
            apellido: dm.docente.apellido,
            telefono: dm.docente.telefono,
            email: dm.docente.email,
            fechaIngreso: dm.docente.fechaIngreso.toISOString(),
            estado: dm.docente.estado,
          }
        : undefined,
    }));
    return { id: materia.id, nombre: materia.nombre, docentes };
  }

  findByNombre(nombre: string) {
    return this.prisma.materia.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
    });
  }

  create(data: CrearMateriaDto) {
    return this.prisma.materia.create({ data });
  }
  update(id: number, data: ActualizarMateriaDto) {
    return this.prisma.materia.update({ where: { id }, data });
  }
  delete(id: number) {
    return this.prisma.materia.delete({ where: { id } });
  }
}
