import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto';

export class FiltrarDiasSinClasesDto extends PaginacionQueryDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cursoId?: number;
}
