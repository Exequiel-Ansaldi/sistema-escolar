import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CrearAsistenciaDto } from './crear-asistencia.dto';

export class RegistrarAsistenciasMasivoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearAsistenciaDto)
  datos: CrearAsistenciaDto[];
}
