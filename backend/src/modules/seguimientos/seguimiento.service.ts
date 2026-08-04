import { Injectable } from '@nestjs/common';
import { SeguimientoRepository } from './repositories/seguimiento.repository';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';
import type { SeguimientoResponse } from './dto/seguimiento-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class SeguimientoService {
  constructor(private repo: SeguimientoRepository) {}

  findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<SeguimientoResponse>> {
    return this.repo.findByAlumno(alumnoId, page, limit);
  }

  create(dto: CrearSeguimientoDto) {
    return this.repo.create(dto);
  }
}
