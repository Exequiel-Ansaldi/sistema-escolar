import type { DocenteResponse } from '../../docentes/dto/docente-response';
import type { MateriaResponse } from '../../materias/dto/materia-response';
import type { CursoResponse } from '../../cursos/dto/curso-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

export interface ModuloNoDictadoResponse {
  id: number;
  factor: string;
  cantidad: number;
  observacion?: string | null;
}

export interface ModuloMensualResponse {
  id: number;
  docenteId: number;
  cursoId: number;
  materiaId: number;
  mes: string;
  modulosPrevistos: number;
  modulosDictados: number;
  noDictados?: ModuloNoDictadoResponse[];
  observacion?: string | null;
  docente?: DocenteResponse;
  materia?: MateriaResponse;
  curso?: CursoResponse;
}

export interface ModulosMensualesMesResponse extends PaginatedResult<ModuloMensualResponse> {
  totalPrevistos: number;
  totalDictados: number;
}
