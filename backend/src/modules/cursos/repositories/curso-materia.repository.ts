import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AsignarMateriaCursoDto } from '../dto/asignar-materia-curso.dto';
import { ActualizarCargaHorariaDto } from '../dto/actualizar-carga-horaria.dto';
import type {
  CursoMateriaResponse,
  CursoGruposResponse,
} from '../dto/curso-materia-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class CursoMateriaRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    anio?: string,
    division?: string,
    turno?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CursoMateriaResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.CursoMateriaWhereInput = {
      curso: {
        estado: 'activo',
        ...(anio ? { anio: Number(anio) } : {}),
        ...(division ? { division } : {}),
        ...(turno ? { turno } : {}),
      },
    };
    const [data, total] = await Promise.all([
      this.prisma.cursoMateria.findMany({
        where,
        include: { materia: true, curso: true },
        orderBy: [
          { curso: { anio: 'asc' } },
          { curso: { division: 'asc' } },
          { materia: { nombre: 'asc' } },
        ],
        skip,
        take: limit,
      }),
      this.prisma.cursoMateria.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findGrupos(
    anio?: string,
    division?: string,
    turno?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CursoGruposResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.CursoWhereInput = {
      estado: 'activo',
      ...(anio ? { anio: Number(anio) } : {}),
      ...(division ? { division } : {}),
      ...(turno ? { turno } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.curso.findMany({
        where,
        orderBy: [{ anio: 'asc' }, { division: 'asc' }],
        skip,
        take: limit,
        include: {
          materias: {
            include: { materia: true },
            orderBy: { materia: { nombre: 'asc' } },
          },
        },
      }),
      this.prisma.curso.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findByCurso(cursoId: number): Promise<CursoMateriaResponse[]> {
    return this.prisma.cursoMateria.findMany({
      where: { cursoId },
      include: { materia: true },
    });
  }

  asignar(dto: AsignarMateriaCursoDto) {
    return this.prisma.cursoMateria.create({ data: dto });
  }

  actualizarCarga(
    cursoId: number,
    materiaId: number,
    dto: ActualizarCargaHorariaDto,
  ) {
    const data: Prisma.CursoMateriaUpdateInput = {};
    if (dto.cargaHoraria !== undefined) data.cargaHoraria = dto.cargaHoraria;
    if (dto.modulosPorSemana !== undefined)
      data.modulosPorSemana = dto.modulosPorSemana;
    if (dto.cargaHoraria === undefined && dto.modulosPorSemana !== undefined) {
      data.cargaHoraria = Math.round((dto.modulosPorSemana * 40) / 60);
    }
    return this.prisma.cursoMateria.update({
      where: { cursoId_materiaId: { cursoId, materiaId } },
      data,
    });
  }

  quitar(cursoId: number, materiaId: number) {
    return this.prisma.cursoMateria.delete({
      where: { cursoId_materiaId: { cursoId, materiaId } },
    });
  }
}
