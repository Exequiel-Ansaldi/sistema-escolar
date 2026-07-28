import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findByNombreUsuario(nombreUsuario: string) {
    return this.prisma.usuario.findUnique({
      where: { nombreUsuario },
      include: { rol: true },
    });
  }
}