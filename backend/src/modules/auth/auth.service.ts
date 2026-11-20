import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './repositories/auth.repository';
import { LoginDto } from './dto/login.dto';
import type { LoginResponse } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const cuenta = await this.authRepository.findByNombreUsuario(
      dto.nombreUsuario,
    );

    if (!cuenta || !cuenta.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(
      dto.contrasena,
      cuenta.contrasena,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { id: cuenta.id, rol: cuenta.rol.nombreRol };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: cuenta.id,
        nombreUsuario: cuenta.nombreUsuario,
        nombre: cuenta.persona.nombre,
        apellido: cuenta.persona.apellido,
        rol: cuenta.rol.nombreRol,
      },
    };
  }
}
