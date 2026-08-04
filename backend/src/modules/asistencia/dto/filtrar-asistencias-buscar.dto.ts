import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto';

export class FiltrarAsistenciasBuscarDto extends PaginacionQueryDto {
  @IsString()
  q: string;

  @IsDateString()
  fecha: string;

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
