import { IsInt, IsOptional, Min } from 'class-validator';

export class ActualizarCargaHorariaDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  cargaHoraria?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  modulosPorSemana?: number;
}
