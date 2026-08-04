import type { InscripcionResponse } from '../../inscripcion/dto/inscripcion-response';
import type { TutorResponse } from '../../tutores/dto/tutor-response';

export interface AlumnoResponse {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  nacimiento: string;
  direccion: string;
  telefono: string;
  estado: string;
  fechaIngreso: string;
  fechaEgreso?: string | null;
  inscripciones?: InscripcionResponse[];
  tutores?: TutorResponse[];
}
