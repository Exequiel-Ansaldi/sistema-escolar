import type { DocenteResponse } from '../../docentes/dto/docente-response';
import type { MateriaResponse } from '../../materias/dto/materia-response';
import type { CursoResponse } from '../../cursos/dto/curso-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

export interface ModuloSemanalResponse {
  id: number;
  docenteId: number;
  cursoId: number;
  materiaId: number;
  semanaInicio: string;
  modulosPrevistos: number;
  modulosDictados: number;
  factor?: string | null;
  observacion?: string | null;
  docente?: DocenteResponse;
  materia?: MateriaResponse;
  curso?: CursoResponse;
}

export interface ModulosSemanaMesResponse extends PaginatedResult<ModuloSemanalResponse> {
  totalPrevistos: number;
  totalDictados: number;
}
