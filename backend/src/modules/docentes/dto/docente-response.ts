import type { DocenteMateriaResponse } from './docente-materia-response';
import type { LicenciaResponse } from '../../licencias/dto/licencia-response';

export interface DocenteResponse {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  estado: string;
}

export interface DocenteDetalleResponse extends DocenteResponse {
  materias?: DocenteMateriaResponse[];
  licencias?: LicenciaResponse[];
}
