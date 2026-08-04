import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class CrearDocenteDto {
  @IsNumberString()
  dni: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  telefono: string;

  @IsString()
  email: string;

  @IsDateString()
  fechaIngreso: string;

  @IsOptional()
  @IsString()
  estado?: string;
}
