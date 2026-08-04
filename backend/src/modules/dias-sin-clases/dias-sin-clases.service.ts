import { Injectable } from '@nestjs/common';
import { DiasSinClasesRepository } from './repositories/dias-sin-clases.repository';
import { CrearDiaSinClasesDto } from './dto/crear-dia-sin-clases.dto';
import type { DiaSinClasesResponse } from './dto/dia-sin-clases-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class DiasSinClasesService {
  constructor(private repo: DiasSinClasesRepository) {}

  listar(
    desde?: string,
    hasta?: string,
    cursoId?: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<DiaSinClasesResponse>> {
    const d = desde ? new Date(desde) : undefined;
    const h = hasta ? new Date(hasta) : undefined;
    return this.repo.find(d, h, cursoId, page, limit);
  }

  crear(dto: CrearDiaSinClasesDto) {
    return this.repo.create(dto);
  }

  eliminar(id: number) {
    return this.repo.delete(id);
  }
}
