import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearCalificacionDto } from '../dto/crear-calificacion.dto';
import { Prisma } from '@prisma/client';
import type {
  CalificacionResponse,
  PromedioAlumnoResponse,
  PromedioPorTrimestreResponse,
} from '../dto/calificacion-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type CalificacionConMateria = Prisma.CalificacionGetPayload<{
  include: { materia: true };
}>;

function serializarCalificacion(
  cal: CalificacionConMateria,
): CalificacionResponse {
  return {
    id: cal.id,
    alumnoId: cal.alumnoId,
    materiaId: cal.materiaId,
    nota: cal.nota,
    trimestre: cal.trimestre,
    fecha: cal.fecha.toISOString(),
    observacion: cal.observacion,
    materia: cal.materia,
  };
}

@Injectable()
export class CalificacionesRepository {
  constructor(private prisma: PrismaService) {}

  async findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CalificacionResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.CalificacionWhereInput = { alumnoId };
    const [rows, total] = await Promise.all([
      this.prisma.calificacion.findMany({
        where,
        include: { materia: true },
        orderBy: [{ trimestre: 'asc' }, { materia: { nombre: 'asc' } }],
        skip,
        take: limit,
      }),
      this.prisma.calificacion.count({ where }),
    ]);
    const data = rows.map(serializarCalificacion);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByAlumnoYMateria(
    alumnoId: number,
    materiaId: number,
  ): Promise<CalificacionResponse[]> {
    const rows = await this.prisma.calificacion.findMany({
      where: { alumnoId, materiaId },
      include: { materia: true },
      orderBy: { trimestre: 'asc' },
    });
    return rows.map(serializarCalificacion);
  }

  promedioAlumno(alumnoId: number): Promise<PromedioAlumnoResponse> {
    return this.prisma.calificacion.aggregate({
      where: { alumnoId },
      _avg: { nota: true },
      _count: true,
    });
  }

  async promedioPorTrimestre(
    alumnoId: number,
  ): Promise<PromedioPorTrimestreResponse[]> {
    const rows = await this.prisma.calificacion.groupBy({
      by: ['trimestre'],
      where: { alumnoId },
      _avg: { nota: true },
      _count: true,
      orderBy: { trimestre: 'asc' },
    });
    return rows.map((r) => ({
      trimestre: r.trimestre,
      promedio: r._avg.nota,
      count: r._count,
    }));
  }

  promedioPorMateria(alumnoId: number) {
    return this.prisma.calificacion.groupBy({
      by: ['materiaId'],
      where: { alumnoId },
      _avg: { nota: true },
      _count: true,
    });
  }

  findById(id: number) {
    return this.prisma.calificacion.findUnique({ where: { id } });
  }

  create(data: CrearCalificacionDto): Promise<CalificacionResponse> {
    return this.prisma.calificacion
      .create({
        data: {
          ...data,
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
        },
        include: { materia: true },
      })
      .then(serializarCalificacion);
  }

  update(
    id: number,
    data: Partial<CrearCalificacionDto>,
  ): Promise<CalificacionResponse> {
    return this.prisma.calificacion
      .update({
        where: { id },
        data: { ...data, fecha: data.fecha ? new Date(data.fecha) : undefined },
        include: { materia: true },
      })
      .then(serializarCalificacion);
  }
}
