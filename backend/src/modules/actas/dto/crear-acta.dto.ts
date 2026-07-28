import { IsInt, IsDateString, IsString, IsOptional } from 'class-validator';

export class CrearActaDto {
  @IsInt()
  alumnoId: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsString()
  tipo: string;

  @IsString()
  descripcion: string;

  @IsString()
  numero: string;
}

export class CrearAcuerdoDto {
  @IsInt()
  alumnoId: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsString()
  tipo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class CrearSeguimientoDto {
  @IsInt()
  alumnoId: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsString()
  tipo: string;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class CrearTutorDto {
  @IsInt()
  alumnoId: number;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  dni: string;
}