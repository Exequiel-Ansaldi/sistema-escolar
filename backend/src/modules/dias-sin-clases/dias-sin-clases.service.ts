import { Injectable } from '@nestjs/common';
import { DiasSinClasesRepository } from './repositories/dias-sin-clases.repository';
import { CrearDiaSinClasesDto } from './dto/crear-dia-sin-clases.dto';

@Injectable()
export class DiasSinClasesService {
  constructor(private repo: DiasSinClasesRepository) {}

  listar(desde?: string, hasta?: string, cursoId?: string) {
    const d = desde ? new Date(desde) : undefined;
    const h = hasta ? new Date(hasta) : undefined;
    const c = cursoId ? Number(cursoId) : undefined;
    return this.repo.find(d, h, c);
  }

  crear(dto: CrearDiaSinClasesDto) {
    return this.repo.create(dto);
  }

  eliminar(id: number) {
    return this.repo.delete(id);
  }
}
