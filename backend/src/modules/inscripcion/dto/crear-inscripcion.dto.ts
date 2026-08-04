import { IsInt, IsOptional, IsString } from 'class-validator';

export class CrearInscripcionDto {
  @IsInt()
  alumnoId: number;

  @IsInt()
  cursoId: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
