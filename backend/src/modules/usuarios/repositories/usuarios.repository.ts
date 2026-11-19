import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import type { UsuarioResponse } from '../dto/usuario-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type UsuarioConPersona = {
  id: number;
  nombreUsuario: string;
  rolId: number;
  persona: { nombre: string; apellido: string; estado: string };
  rol?: { id: number; nombreRol: string };
};

function serializarUsuario(u: UsuarioConPersona): UsuarioResponse {
  return {
    id: u.id,
    nombreUsuario: u.nombreUsuario,
    nombre: u.persona.nombre,
    apellido: u.persona.apellido,
    activo: u.persona.estado === 'activo',
    rolId: u.rolId,
    ...(u.rol ? { rol: u.rol } : {}),
  };
}

const USUARIO_INCLUDE = {
  persona: { select: { nombre: true, apellido: true, estado: true } },
  rol: { select: { id: true, nombreRol: true } },
};

@Injectable()
export class UsuariosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<UsuarioResponse>> {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.usuario.findMany({
        skip,
        take: limit,
        include: USUARIO_INCLUDE,
      }),
      this.prisma.usuario.count(),
    ]);
    const data = rows.map(serializarUsuario);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<UsuarioResponse | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: USUARIO_INCLUDE,
    });
    return usuario ? serializarUsuario(usuario) : null;
  }

  findByNombreUsuario(nombreUsuario: string) {
    return this.prisma.usuario.findUnique({ where: { nombreUsuario } });
  }

  async create(data: CrearUsuarioDto & { contrasena: string }): Promise<UsuarioResponse> {
    const { nombre, apellido, ...usuarioData } = data;
    const creado = await this.prisma.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: { nombre, apellido },
      });
      return tx.usuario.create({
        data: { ...usuarioData, personaId: persona.id },
        include: USUARIO_INCLUDE,
      });
    });
    return serializarUsuario(creado);
  }

  async update(id: number, data: ActualizarUsuarioDto & { contrasena?: string }): Promise<UsuarioResponse> {
    const { nombre, apellido, contrasena, ...usuarioData } = data;
    const updateData: Record<string, unknown> = { ...usuarioData };
    if (contrasena !== undefined) updateData.contrasena = contrasena;
    const personaPayload: Record<string, string> = {};
    if (nombre !== undefined) personaPayload.nombre = nombre;
    if (apellido !== undefined) personaPayload.apellido = apellido;
    if (Object.keys(personaPayload).length > 0) {
      updateData.persona = { update: personaPayload };
    }
    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      include: USUARIO_INCLUDE,
    });
    return serializarUsuario(actualizado);
  }

  async disable(id: number): Promise<UsuarioResponse> {
    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: { persona: { update: { estado: 'inactivo' } } },
      include: USUARIO_INCLUDE,
    });
    return serializarUsuario(actualizado);
  }
}
