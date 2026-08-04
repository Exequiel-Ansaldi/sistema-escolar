import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto';

export class FiltrarInscripcionesDto extends PaginacionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  anio?: number;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  turno?: string;
}
