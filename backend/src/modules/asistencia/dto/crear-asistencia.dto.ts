import {
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CrearAsistenciaDto {
  @IsInt()
  alumnoId: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsBoolean()
  justificada?: boolean;

  @IsOptional()
  @IsString()
  observacion?: string;
}
