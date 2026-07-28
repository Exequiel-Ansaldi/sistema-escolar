import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearCursoDto } from '../dto/crear-curso.dto';
import { ActualizarCursoDto } from '../dto/actualizar-curso.dto';

@Injectable()
export class CursosRepository {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.curso.findMany({ orderBy: [{ anio: 'asc' }, { division: 'asc' }] });
  }

  findById(id: number) {
    return this.prisma.curso.findUnique({
      where: { id },
      include: {
        inscripciones: {
          include: { alumno: true },
          where: { estado: 'activo' },
        },
        materias: {
          include: { materia: true },
        },
      },
    });
  }

  findByAnioDivisionTurno(anio: number, division: string, turno: string) {
    return this.prisma.curso.findFirst({ where: { anio, division, turno, estado: 'activo' } });
  }

  create(data: CrearCursoDto) {
    return this.prisma.curso.create({ data });
  }

  update(id: number, data: ActualizarCursoDto) {
    return this.prisma.curso.update({ where: { id }, data });
  }

  disable(id: number) {
    return this.prisma.curso.update({ where: { id }, data: { estado: 'inactivo' } });
  }
}