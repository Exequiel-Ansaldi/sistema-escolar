import { IsInt, IsDateString, IsString, IsOptional } from 'class-validator';

export class CrearLicenciaDto {
  @IsInt()
  docenteId: number;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class CrearHorarioDto {
  @IsInt()
  docenteId: number;

  @IsInt()
  cursoId: number;

  @IsInt()
  materiaId: number;

  @IsString()
  horaInicio: string;

  @IsString()
  diaSemana: string;

  @IsString()
  horaFin: string;
}
