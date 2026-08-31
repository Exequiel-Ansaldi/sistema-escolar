import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class AsignarMateriaMasivoDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  cursoIds: number[];

  @IsInt()
  materiaId: number;

  @IsInt()
  modulosPorSemana: number;
}
