import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosRepository {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({ include: { rol: true } });
  }

  findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

  create(data: CrearUsuarioDto & { contrasena: string }) {
    return this.prisma.usuario.create({ data });
  }

  update(id: number, data: ActualizarUsuarioDto & { contrasena?: string }) {
    return this.prisma.usuario.update({ where: { id }, data });
  }

  disable(id: number) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}