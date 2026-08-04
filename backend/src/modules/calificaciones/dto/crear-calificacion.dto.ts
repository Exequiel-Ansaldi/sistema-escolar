import {
  IsInt,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearCalificacionDto {
  @IsInt()
  alumnoId: number;

  @IsInt()
  materiaId: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  nota: number;

  @IsInt()
  @Min(1)
  @Max(3)
  trimestre: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}
