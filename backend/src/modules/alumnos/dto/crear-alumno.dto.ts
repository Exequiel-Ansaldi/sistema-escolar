import { IsString, IsDateString, IsOptional, IsNumberString } from 'class-validator';

export class CrearAlumnoDto {
  @IsNumberString()
  dni: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsDateString()
  nacimiento: string;

  @IsString()
  direccion: string;

  @IsString()
  telefono: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsDateString()
  fechaIngreso: string;

  @IsOptional()
  @IsDateString()
  fechaEgreso?: string;
}