import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearCursoDto } from '../dto/crear-curso.dto';
import { ActualizarCursoDto } from '../dto/actualizar-curso.dto';
import { Prisma } from '@prisma/client';
import type {
  CursoResponse,
  CursoDetalleResponse,
  InscripcionCursoResponse,
} from '../dto/curso-response';
import type { CursoMateriaResponse } from '../dto/curso-materia-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type CursoConRelaciones = Prisma.CursoGetPayload<{
  include: {
    inscripciones: { include: { alumno: true }; where: { estado: string } };
    materias: { include: { materia: true } };
  };
}>;

function serializarCurso(curso: CursoConRelaciones): CursoDetalleResponse {
  const inscripciones: InscripcionCursoResponse[] = (
    curso.inscripciones ?? []
  ).map((i) => ({
    id: i.id,
    alumnoId: i.alumnoId,
    cursoId: i.cursoId,
    fechaInscripcion: i.fechaInscripcion.toISOString(),
    estado: i.estado,
    alumno: {
      id: i.alumno.id,
      dni: i.alumno.dni,
      nombre: i.alumno.nombre,
      apellido: i.alumno.apellido,
      nacimiento: i.alumno.nacimiento.toISOString(),
      direccion: i.alumno.direccion,
      telefono: i.alumno.telefono,
      estado: i.alumno.estado,
      fechaIngreso: i.alumno.fechaIngreso.toISOString(),
      fechaEgreso: i.alumno.fechaEgreso
        ? i.alumno.fechaEgreso.toISOString()
        : null,
    },
  }));
  const materias: CursoMateriaResponse[] = (curso.materias ?? []).map((m) => ({
    cursoId: m.cursoId,
    materiaId: m.materiaId,
    cargaHoraria: m.cargaHoraria,
    modulosPorSemana: m.modulosPorSemana,
    materia: m.materia,
  }));
  return {
    id: curso.id,
    anio: curso.anio,
    division: curso.division,
    turno: curso.turno,
    orientacion: curso.orientacion,
    cicloLectivo: curso.cicloLectivo,
    estado: curso.estado,
    inscripciones,
    materias,
  };
}

@Injectable()
export class CursosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    filters?: { anio?: number; division?: string; turno?: string },
  ): Promise<PaginatedResult<CursoResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.CursoWhereInput = {};
    if (filters?.anio) where.anio = filters.anio;
    if (filters?.division) where.division = filters.division;
    if (filters?.turno) where.turno = filters.turno;
    const [rows, total] = await Promise.all([
      this.prisma.curso.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ anio: 'asc' }, { division: 'asc' }],
      }),
      this.prisma.curso.count({ where }),
    ]);
    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<CursoDetalleResponse | null> {
    const curso = await this.prisma.curso.findUnique({
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
    return curso ? serializarCurso(curso) : null;
  }

  findByAnioDivisionTurno(anio: number, division: string, turno: string) {
    return this.prisma.curso.findFirst({
      where: { anio, division, turno, estado: 'activo' },
    });
  }

  create(data: CrearCursoDto) {
    return this.prisma.curso.create({ data });
  }

  update(id: number, data: ActualizarCursoDto) {
    return this.prisma.curso.update({ where: { id }, data });
  }

  disable(id: number) {
    return this.prisma.curso.update({
      where: { id },
      data: { estado: 'inactivo' },
    });
  }
}
