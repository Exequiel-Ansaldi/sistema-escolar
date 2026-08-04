import type { MateriaResponse } from '../../materias/dto/materia-response';

export interface CalificacionResponse {
  id: number;
  alumnoId: number;
  materiaId: number;
  nota: number;
  trimestre: number;
  fecha: string;
  observacion?: string | null;
  materia?: MateriaResponse;
}

export interface PromedioAlumnoResponse {
  _avg: { nota: number | null };
  _count: number;
}

export interface PromedioPorTrimestreResponse {
  trimestre: number;
  promedio: number | null;
  count: number;
}

export interface PromedioPorMateriaResponse {
  materiaId: number;
  promedio: number | null;
  count: number;
  materia?: MateriaResponse;
}
