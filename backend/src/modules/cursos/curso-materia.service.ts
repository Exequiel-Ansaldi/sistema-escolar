import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AsignarMateriaCursoDto } from './dto/asignar-materia-curso.dto';

@Injectable()
export class CursoMateriaService {
  constructor(private prisma: PrismaService) {}

  findAll(anio?: string, division?: string, turno?: string) {
    return this.prisma.cursoMateria.findMany({
      where: {
        curso: {
          estado: 'activo',
          ...(anio ? { anio: Number(anio) } : {}),
          ...(division ? { division } : {}),
          ...(turno ? { turno } : {}),
        },
      },
      include: { materia: true, curso: true },
      orderBy: [{ curso: { anio: 'asc' } }, { curso: { division: 'asc' } }, { materia: { nombre: 'asc' } }],
    });
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
