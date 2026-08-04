import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import type { UsuarioResponse } from '../dto/usuario-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

const USUARIO_SELECT = {
  id: true,
  nombreUsuario: true,
  nombre: true,
  apellido: true,
  activo: true,
  rolId: true,
  rol: true,
};

@Injectable()
export class UsuariosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<UsuarioResponse>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        skip,
        take: limit,
        select: USUARIO_SELECT,
      }),
      this.prisma.usuario.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: number): Promise<UsuarioResponse | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: USUARIO_SELECT,
    });
  }

  findByNombreUsuario(nombreUsuario: string) {
    return this.prisma.usuario.findUnique({ where: { nombreUsuario } });
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
