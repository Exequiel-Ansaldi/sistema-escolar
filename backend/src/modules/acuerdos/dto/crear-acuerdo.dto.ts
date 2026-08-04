import { IsInt, IsDateString, IsString, IsOptional } from 'class-validator';

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
