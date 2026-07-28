import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearMateriaDto } from '../dto/crear-materia.dto';
import { ActualizarMateriaDto } from '../dto/actualizar-materia.dto';

@Injectable()
export class MateriasRepository {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.materia.findMany({ orderBy: { nombre: 'asc' } }); }

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