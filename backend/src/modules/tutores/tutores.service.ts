import { Injectable } from '@nestjs/common';
import { TutoresRepository } from './repositories/tutores.repository';
import { CrearTutorDto } from './dto/crear-tutor.dto';
import type { TutorResponse } from './dto/tutor-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class TutoresService {
  constructor(private repo: TutoresRepository) {}

  findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<TutorResponse>> {
    return this.repo.findByAlumno(alumnoId, page, limit);
  }

  create(dto: CrearTutorDto) {
    return this.repo.create(dto);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
