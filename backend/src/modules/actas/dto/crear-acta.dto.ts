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
