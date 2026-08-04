import { Injectable } from '@nestjs/common';
import { AcuerdosRepository } from './repositories/acuerdos.repository';
import { CrearAcuerdoDto } from './dto/crear-acuerdo.dto';
import { ActualizarAcuerdoDto } from './dto/actualizar-acuerdo.dto';
import type { AcuerdoResponse } from './dto/acuerdo-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AcuerdosService {
  constructor(private repo: AcuerdosRepository) {}

  findByAlumno(
    alumnoId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AcuerdoResponse>> {
    return this.repo.findByAlumno(alumnoId, page, limit);
  }

  create(dto: CrearAcuerdoDto) {
    return this.repo.create(dto);
  }

  update(id: number, dto: ActualizarAcuerdoDto) {
    return this.repo.update(id, dto);
  }
}
