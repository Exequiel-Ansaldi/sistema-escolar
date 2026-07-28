import { IsString, IsInt, IsOptional, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  nombreUsuario: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsInt()
  rolId: number;
}