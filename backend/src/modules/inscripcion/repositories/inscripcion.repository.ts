import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearInscripcionDto } from '../dto/crear-inscripcion.dto';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class InscripcionRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.inscripcion.findMany({
        skip,
        take: limit,
        include: {
          alumno: true,
          curso: true,
        },
        orderBy: { fechaInscripcion: 'desc' },
      }),
      this.prisma.inscripcion.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

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