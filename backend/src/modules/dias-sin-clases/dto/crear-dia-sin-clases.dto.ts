import { IsDateString, IsIn, IsOptional, IsInt } from 'class-validator';

export class CrearDiaSinClasesDto {
  @IsDateString()
  fecha: string;

  @IsIn(['feriado', 'paro'])
  tipo: string;

  @IsOptional()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  cursoId?: number;
}
