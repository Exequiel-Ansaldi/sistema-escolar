import { IsInt } from 'class-validator';

export class AsignarMateriaDto {
  @IsInt()
  docenteId: number;

  @IsInt()
  materiaId: number;
}