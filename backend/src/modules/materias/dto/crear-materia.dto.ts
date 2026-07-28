import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CrearMateriaDto {
  @IsString()
  nombre: string;

  @IsInt()
  @Min(0)
  cargaHoraria: number;
}