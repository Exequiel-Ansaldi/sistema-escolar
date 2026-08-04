import { Injectable } from '@nestjs/common';
import { CursoMateriaRepository } from './repositories/curso-materia.repository';
import { AsignarMateriaCursoDto } from './dto/asignar-materia-curso.dto';
import { ActualizarCargaHorariaDto } from './dto/actualizar-carga-horaria.dto';
import type {
  CursoMateriaResponse,
  CursoGruposResponse,
} from './dto/curso-materia-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class CursoMateriaService {
  constructor(private repo: CursoMateriaRepository) {}

  findAll(
    anio?: string,
    division?: string,
    turno?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CursoMateriaResponse>> {
    return this.repo.findAll(anio, division, turno, page, limit);
  }

  findGrupos(
    anio?: string,
    division?: string,
    turno?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CursoGruposResponse>> {
    return this.repo.findGrupos(anio, division, turno, page, limit);
  }

  findByCurso(cursoId: number): Promise<CursoMateriaResponse[]> {
    return this.repo.findByCurso(cursoId);
  }

  asignar(dto: AsignarMateriaCursoDto) {
    return this.repo.asignar(dto);
  }

  actualizarCarga(
    cursoId: number,
    materiaId: number,
    dto: ActualizarCargaHorariaDto,
  ) {
    return this.repo.actualizarCarga(cursoId, materiaId, dto);
  }

  quitar(cursoId: number, materiaId: number) {
    return this.repo.quitar(cursoId, materiaId);
  }
}
