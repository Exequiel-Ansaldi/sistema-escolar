import type { AlumnoResponse } from '../../alumnos/dto/alumno-response';
import type { CursoResponse } from '../../cursos/dto/curso-response';

export interface AsistenciaResponse {
  id: number;
  alumnoId: number;
  fecha: string;
  estado: string;
  justificacion?: string | null;
  observacion?: string | null;
  alumno?: AlumnoResponse;
}

export interface AsistenciaCursoResponse {
  id: number | null;
  alumnoId: number;
  fecha: string;
  estado: string;
  observacion: string | null;
  alumno: AlumnoResponse;
}

export interface AsistenciaBuscarResponse extends AsistenciaCursoResponse {
  curso: CursoResponse;
}
