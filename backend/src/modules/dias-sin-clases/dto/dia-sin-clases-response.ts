import type { CursoResponse } from '../../cursos/dto/curso-response';

export interface DiaSinClasesResponse {
  id: number;
  fecha: string;
  tipo: string;
  descripcion?: string | null;
  cursoId?: number | null;
  curso?: Pick<
    CursoResponse,
    'id' | 'anio' | 'division' | 'turno' | 'orientacion'
  > | null;
  createdAt: string;
}
