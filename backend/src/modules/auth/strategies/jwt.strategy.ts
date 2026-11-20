import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import type { JwtUsuario } from '../dto/jwt-usuario';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: { id: number; rol: string }): Promise<JwtUsuario> {
    const cuenta = await this.prisma.personal.findUnique({
      where: { id: payload.id },
      include: { rol: true },
    });

    if (!cuenta || !cuenta.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return {
      id: cuenta.id,
      rol: cuenta.rol.nombreRol,
      nombreUsuario: cuenta.nombreUsuario,
    };
  }
}
