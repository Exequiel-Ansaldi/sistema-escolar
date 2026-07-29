import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AsignarMateriaCursoDto } from './dto/asignar-materia-curso.dto';

@Injectable()
export class CursoMateriaService {
  constructor(private prisma: PrismaService) {}

  async findAll(anio?: string, division?: string, turno?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
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
        orderBy: [{ curso: { anio: 'asc' } }, { curso: { division: 'asc' } }, { materia: { nombre: 'asc' } }],
        skip,
        take: limit,
      }),
      this.prisma.cursoMateria.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findGrupos(anio?: string, division?: string, turno?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
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

  findByCurso(cursoId: number) {
    return this.prisma.cursoMateria.findMany({
      where: { cursoId },
      include: { materia: true },
    });
  }

  asignar(dto: AsignarMateriaCursoDto) {
    return this.prisma.cursoMateria.create({ data: dto });
  }

  actualizarCarga(cursoId: number, materiaId: number, body: { cargaHoraria?: number; modulosPorSemana?: number }) {
    const data: any = {};
    if (body.cargaHoraria !== undefined) data.cargaHoraria = body.cargaHoraria;
    if (body.modulosPorSemana !== undefined) data.modulosPorSemana = body.modulosPorSemana;
    if (body.cargaHoraria === undefined && body.modulosPorSemana !== undefined) {
      data.cargaHoraria = Math.round(body.modulosPorSemana * 40 / 60);
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
