import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto';

export class FiltrarModulosMensualesDto extends PaginacionQueryDto {
  @Matches(/^\d{4}-\d{2}$/)
  mes: string;

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  materiaId?: number;
}
