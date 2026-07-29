import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class UsuariosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({ skip, take: limit, include: { rol: true } }),
      this.prisma.usuario.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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