import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import type { UsuarioResponse } from '../dto/usuario-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

// Las cuentas viven en `personal` (subtipo de personas); nombre/apellido son el
// display de la persona asociada. activo es estado de la CUENTA.
type CuentaConPersona = {
  id: number;
  nombreUsuario: string;
  rolId: number;
  activo: boolean;
  persona: { nombre: string; apellido: string };
  rol?: { id: number; nombreRol: string };
};

function serializarCuenta(c: CuentaConPersona): UsuarioResponse {
  return {
    id: c.id,
    nombreUsuario: c.nombreUsuario,
    nombre: c.persona.nombre,
    apellido: c.persona.apellido,
    activo: c.activo,
    rolId: c.rolId,
    ...(c.rol ? { rol: c.rol } : {}),
  };
}

const CUENTA_INCLUDE = {
  persona: { select: { nombre: true, apellido: true } },
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
      this.prisma.personal.findMany({
        skip,
        take: limit,
        include: CUENTA_INCLUDE,
      }),
      this.prisma.personal.count(),
    ]);
    const data = rows.map(serializarCuenta);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<UsuarioResponse | null> {
    const cuenta = await this.prisma.personal.findUnique({
      where: { id },
      include: CUENTA_INCLUDE,
    });
    return cuenta ? serializarCuenta(cuenta) : null;
  }

  findByNombreUsuario(nombreUsuario: string) {
    return this.prisma.personal.findUnique({ where: { nombreUsuario } });
  }

  create(data: CrearUsuarioDto & { contrasena: string }): Promise<UsuarioResponse> {
    const { nombre, apellido, nombreUsuario, rolId, contrasena } = data;
    return this.prisma.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: { nombre, apellido },
      });
      const cuenta = await tx.personal.create({
        data: { personaId: persona.id, nombreUsuario, contrasena, rolId },
        include: CUENTA_INCLUDE,
      });
      return serializarCuenta(cuenta);
    });
  }

  async update(
    id: number,
    data: ActualizarUsuarioDto & { contrasena?: string },
  ): Promise<UsuarioResponse> {
    const { nombre, apellido, nombreUsuario, contrasena, rolId } = data;
    const updateData: Record<string, unknown> = {};
    if (nombreUsuario !== undefined)
      updateData.nombreUsuario = nombreUsuario;
    if (contrasena !== undefined) updateData.contrasena = contrasena;
    if (rolId !== undefined) updateData.rolId = rolId;
    const personaPayload: Record<string, string> = {};
    if (nombre !== undefined) personaPayload.nombre = nombre;
    if (apellido !== undefined) personaPayload.apellido = apellido;
    if (Object.keys(personaPayload).length > 0) {
      updateData.persona = { update: personaPayload };
    }
    const actualizado = await this.prisma.personal.update({
      where: { id },
      data: updateData,
      include: CUENTA_INCLUDE,
    });
    return serializarCuenta(actualizado);
  }

  async disable(id: number): Promise<UsuarioResponse> {
    const actualizado = await this.prisma.personal.update({
      where: { id },
      data: { activo: false },
      include: CUENTA_INCLUDE,
    });
    return serializarCuenta(actualizado);
  }
}
