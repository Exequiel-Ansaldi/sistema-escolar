import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  nombreUsuario: string;

  @IsString()
  @MinLength(6)
  contrasena: string;
}
