import { IsInt, IsString } from 'class-validator';

export class CrearTutorDto {
  @IsInt()
  alumnoId: number;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  dni: string;
}
