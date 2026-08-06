import { IsInt, IsIn, IsOptional, IsString, Min } from 'class-validator';

export class ModuloNoDictadoDto {
  @IsString()
  @IsIn(['ausencia', 'licencia', 'paro', 'asamblea', 'feriado', 'otro'])
  factor: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}
