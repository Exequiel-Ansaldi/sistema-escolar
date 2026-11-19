import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearTutorDto } from '../dto/crear-tutor.dto';
import type { TutorResponse } from '../dto/tutor-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type TutorConPersona = { id: number; alumnoId: number; persona: { dni: string | null; nombre: string; apellido: string } };

function serializarTutor(tutor: TutorConPersona): TutorResponse {
  return {
    id: tutor.id,
    alumnoId: tutor.alumnoId,
    nombre: tutor.persona.nombre,
    apellido: tutor.persona.apellido,
    dni: tutor.persona.dni ?? '',
  };
}

@Injectable()
export class TutoresRepository {
  constructor(private prisma: PrismaService) {}

  async findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<TutorResponse>> {
    const skip = (page - 1) * limit;
    const where = { alumnoId };
    const [rows, total] = await Promise.all([
      this.prisma.tutor.findMany({
        where,
        skip,
        take: limit,
        include: { persona: true },
      }),
      this.prisma.tutor.count({ where }),
    ]);
    const data = rows.map(serializarTutor);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // La identidad del tutor vive en personas: se reutiliza la persona si el
  // dni ya existe (mismo tutor para varios alumnos), o se crea una nueva.
  async create(data: CrearTutorDto): Promise<TutorResponse> {
    let persona = await this.prisma.persona.findUnique({
      where: { dni: data.dni },
    });
    if (!persona) {
      persona = await this.prisma.persona.create({
        data: {
          dni: data.dni,
          nombre: data.nombre,
          apellido: data.apellido,
        },
      });
    }
    const tutor = await this.prisma.tutor.create({
      data: { alumnoId: data.alumnoId, personaId: persona.id },
      include: { persona: true },
    });
    return serializarTutor(tutor);
  }

  async delete(id: number): Promise<TutorResponse> {
    const tutor = await this.prisma.tutor.delete({
      where: { id },
      include: { persona: true },
    });
    return serializarTutor(tutor);
  }
}
