import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class CrearCursoDto {
  @IsInt()
  @Min(1)
  anio: number;

  @IsString()
  division: string;

  @IsString()
  turno: string;

  @IsString()
  orientacion: string;

  @IsInt()
  @Min(1)
  cicloLectivo: number;

  @IsOptional()
  @IsString()
  estado?: string;
}