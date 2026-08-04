import { IsInt, IsDateString, IsString, IsOptional } from 'class-validator';

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
