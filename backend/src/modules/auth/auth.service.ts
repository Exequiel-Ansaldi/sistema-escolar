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
    const usuario = await this.authRepository.findByNombreUsuario(
      dto.nombreUsuario,
    );

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(
      dto.contrasena,
      usuario.contrasena,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { id: usuario.id, rol: usuario.rol.nombreRol };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol.nombreRol,
      },
    };
  }
}
