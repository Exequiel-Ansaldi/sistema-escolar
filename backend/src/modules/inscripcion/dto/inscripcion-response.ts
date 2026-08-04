import type { AlumnoResponse } from '../../alumnos/dto/alumno-response';
import type { CursoResponse } from '../../cursos/dto/curso-response';

export interface InscripcionResponse {
  id: number;
  alumnoId: number;
  cursoId: number;
  fechaInscripcion: string;
  estado: string;
  alumno?: AlumnoResponse;
  curso?: CursoResponse;
}
