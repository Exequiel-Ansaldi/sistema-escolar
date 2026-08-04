import type { DocenteResponse } from './docente-response';
import type { MateriaResponse } from '../../materias/dto/materia-response';

export interface DocenteMateriaResponse {
  docenteId: number;
  materiaId: number;
  materia?: MateriaResponse;
  docente?: DocenteResponse;
}
