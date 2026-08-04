import { IsOptional, IsDateString } from 'class-validator';

export class FiltrarReporteAsistenciaDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
