import { IsInt, IsDateString, Min, Max, IsOptional, IsString, IsIn } from 'class-validator';

export class CrearModuloSemanaDto {
  @IsInt()
  docenteId: number;

  @IsInt()
  cursoId: number;

  @IsInt()
  materiaId: number;

  @IsDateString()
  semanaInicio: string;

  @IsInt()
  @Min(0)
  modulosPrevistos: number;

  @IsInt()
  @Min(0)
  modulosDictados: number;

  @IsOptional()
  @IsString()
  @IsIn(['ausencia', 'licencia', 'paro', 'asamblea', 'feriado', 'otro'])
  factor?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}
