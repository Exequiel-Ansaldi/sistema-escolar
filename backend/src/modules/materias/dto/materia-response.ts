import type { DocenteMateriaResponse } from '../../docentes/dto/docente-materia-response';

export interface MateriaResponse {
  id: number;
  nombre: string;
}

export interface MateriaDetalleResponse extends MateriaResponse {
  docentes?: DocenteMateriaResponse[];
}
