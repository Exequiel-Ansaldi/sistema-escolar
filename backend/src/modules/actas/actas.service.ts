import { Injectable } from '@nestjs/common';
import { ActasRepository } from './repositories/actas.repository';
import { CrearActaDto } from './dto/crear-acta.dto';
import type { ActaResponse } from './dto/acta-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ActasService {
  constructor(private repo: ActasRepository) {}

  findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<ActaResponse>> {
    return this.repo.findByAlumno(alumnoId, page, limit);
  }

  create(dto: CrearActaDto) {
    return this.repo.create(dto);
  }
}
