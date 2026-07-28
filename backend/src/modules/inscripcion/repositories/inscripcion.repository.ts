import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearInscripcionDto } from '../dto/crear-inscripcion.dto';

@Injectable()
export class InscripcionRepository {
  constructor(private prisma: PrismaService) {}

  findByAlumnoYCurso(alumnoId: number, cursoId: number) {
    return this.prisma.inscripcion.findUnique({
      where: { alumnoId_cursoId: { alumnoId, cursoId } },
    });
  }

  create(data: CrearInscripcionDto) {
    return this.prisma.inscripcion.create({ data });
  }

  delete(alumnoId: number, cursoId: number) {
    return this.prisma.inscripcion.delete({
      where: { alumnoId_cursoId: { alumnoId, cursoId } },
    });
  }
}