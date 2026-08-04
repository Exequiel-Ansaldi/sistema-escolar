import type { MateriaResponse } from '../../materias/dto/materia-response';
import type { CursoResponse } from './curso-response';

export interface CursoMateriaResponse {
  cursoId: number;
  materiaId: number;
  cargaHoraria: number;
  modulosPorSemana: number;
  materia?: MateriaResponse;
  curso?: CursoResponse;
}

export interface CursoGruposResponse extends CursoResponse {
  materias: CursoMateriaResponse[];
}
