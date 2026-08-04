import type { AlumnoResponse } from '../../alumnos/dto/alumno-response';
import type { CursoMateriaResponse } from './curso-materia-response';

export interface CursoResponse {
  id: number;
  anio: number;
  division: string;
  turno: string;
  orientacion: string;
  cicloLectivo: number;
  estado: string;
}

export interface InscripcionCursoResponse {
  id: number;
  alumnoId: number;
  cursoId: number;
  fechaInscripcion: string;
  estado: string;
  alumno: AlumnoResponse;
}

export interface CursoDetalleResponse extends CursoResponse {
  inscripciones?: InscripcionCursoResponse[];
  materias?: CursoMateriaResponse[];
}
