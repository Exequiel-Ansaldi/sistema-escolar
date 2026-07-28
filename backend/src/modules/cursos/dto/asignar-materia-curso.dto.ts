import { IsInt, IsOptional } from 'class-validator';

export class AsignarMateriaCursoDto {
  @IsInt()
  cursoId: number;

  @IsInt()
  materiaId: number;

  @IsInt()
  cargaHoraria: number;

  @IsInt()
  @IsOptional()
  modulosPorSemana?: number;
}
