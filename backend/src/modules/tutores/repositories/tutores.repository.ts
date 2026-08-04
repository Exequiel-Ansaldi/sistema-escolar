import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearTutorDto } from '../dto/crear-tutor.dto';
import type { TutorResponse } from '../dto/tutor-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

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
    const [data, total] = await Promise.all([
      this.prisma.tutor.findMany({ where, skip, take: limit }),
      this.prisma.tutor.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  create(data: CrearTutorDto): Promise<TutorResponse> {
    return this.prisma.tutor.create({ data });
  }

  delete(id: number): Promise<TutorResponse> {
    return this.prisma.tutor.delete({ where: { id } });
  }
}
