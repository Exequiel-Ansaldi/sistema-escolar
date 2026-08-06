import {
  IsInt,
  Matches,
  Min,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModuloNoDictadoDto } from './modulo-no-dictado.dto';

export class CrearModuloMensualDto {
  @IsInt()
  docenteId: number;

  @IsInt()
  cursoId: number;

  @IsInt()
  materiaId: number;

  @Matches(/^\d{4}-\d{2}$/)
  mes: string;

  @IsInt()
  @Min(0)
  modulosPrevistos: number;

  @IsInt()
  @Min(0)
  modulosDictados: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuloNoDictadoDto)
  noDictados?: ModuloNoDictadoDto[];

  @IsOptional()
  @IsString()
  observacion?: string;
}
