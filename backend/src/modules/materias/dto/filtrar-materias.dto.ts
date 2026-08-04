import { IsOptional, IsString } from 'class-validator';
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto';

export class FiltrarMateriasDto extends PaginacionQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
