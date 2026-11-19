import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearDocenteDto } from '../dto/crear-docente.dto';
import { ActualizarDocenteDto } from '../dto/actualizar-docente.dto';
import { Prisma } from '@prisma/client';
import type {
  DocenteResponse,
  DocenteDetalleResponse,
} from '../dto/docente-response';
import type { DocenteMateriaResponse } from '../dto/docente-materia-response';
import type { LicenciaResponse } from '../../licencias/dto/licencia-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type DocenteConRelaciones = Prisma.DocenteGetPayload<{
  include: { persona: true; materias: { include: { materia: true } }; licencias: true };
}>;

function serializarDocente(
  docente: DocenteConRelaciones,
): DocenteDetalleResponse {
  const materias: DocenteMateriaResponse[] = (docente.materias ?? []).map(
    (m) => ({
      docenteId: m.docenteId,
      materiaId: m.materiaId,
      materia: m.materia,
    }),
  );
  const licencias: LicenciaResponse[] = (docente.licencias ?? []).map((l) => ({
    id: l.id,
    docenteId: l.docenteId,
    fechaInicio: l.fechaInicio.toISOString(),
    fechaFin: l.fechaFin.toISOString(),
    codigo: l.codigo,
    motivo: l.motivo,
    estado: l.estado,
    observacion: l.observacion,
  }));
  return {
    id: docente.id,
    dni: docente.persona.dni ?? '',
    nombre: docente.persona.nombre,
    apellido: docente.persona.apellido,
    telefono: docente.persona.telefono ?? '',
    email: docente.email,
    fechaIngreso: docente.fechaIngreso.toISOString(),
    estado: docente.persona.estado,
    materias,
    licencias,
  };
}

function serializarDocenteSimple(d: Prisma.DocenteGetPayload<{ include: { persona: true } }>): DocenteResponse {
  return {
    id: d.id,
    dni: d.persona.dni ?? '',
    nombre: d.persona.nombre,
    apellido: d.persona.apellido,
    telefono: d.persona.telefono ?? '',
    email: d.email,
    fechaIngreso: d.fechaIngreso.toISOString(),
    estado: d.persona.estado,
  };
}

// Campos de identidad que viven en el supertipo personas
function partirPersonaDocente<T extends Partial<CrearDocenteDto>>(data: T) {
  const { dni, nombre, apellido, telefono, estado, ...resto } = data;
  const persona: Partial<Prisma.PersonaCreateInput> = {};
  if (dni !== undefined) persona.dni = dni;
  if (nombre !== undefined) persona.nombre = nombre;
  if (apellido !== undefined) persona.apellido = apellido;
  if (telefono !== undefined) persona.telefono = telefono;
  if (estado !== undefined) persona.estado = estado;
  return { persona, resto };
}

@Injectable()
export class DocentesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResult<DocenteResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.DocenteWhereInput = {
      persona: {
        estado: 'activo',
        ...(search
          ? {
              OR: [
                { nombre: { contains: search, mode: 'insensitive' } },
                { apellido: { contains: search, mode: 'insensitive' } },
                { dni: { contains: search } },
              ],
            }
          : {}),
      },
    };
    const [rows, total] = await Promise.all([
      this.prisma.docente.findMany({
        skip,
        take: limit,
        where,
        orderBy: { persona: { apellido: 'asc' } },
        include: { persona: true },
      }),
      this.prisma.docente.count({ where }),
    ]);
    const data = rows.map(serializarDocenteSimple);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<DocenteDetalleResponse | null> {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        persona: true,
        materias: { include: { materia: true } },
        licencias: true,
      },
    });
    return docente ? serializarDocente(docente) : null;
  }

  findByEmail(email: string) {
    return this.prisma.docente.findUnique({ where: { email } });
  }

  findByDni(dni: string) {
    return this.prisma.docente.findFirst({ where: { persona: { dni } } });
  }

  async create(data: CrearDocenteDto): Promise<DocenteResponse> {
    const { persona, resto } = partirPersonaDocente(data);
    const creado = await this.prisma.docente.create({
      data: {
        email: resto.email,
        fechaIngreso: new Date(resto.fechaIngreso),
        persona: { create: persona as Prisma.PersonaCreateInput },
      },
      include: { persona: true },
    });
    return serializarDocenteSimple(creado);
  }

  async update(id: number, data: ActualizarDocenteDto): Promise<DocenteResponse> {
    const { persona, resto } = partirPersonaDocente(data);
    const updateData: Prisma.DocenteUpdateInput = {};
    if (resto.email !== undefined) updateData.email = resto.email;
    if (resto.fechaIngreso)
      updateData.fechaIngreso = new Date(resto.fechaIngreso);
    const personaPayload: Prisma.PersonaUpdateInput = {};
    if (persona.dni !== undefined) personaPayload.dni = persona.dni;
    if (persona.nombre !== undefined) personaPayload.nombre = persona.nombre;
    if (persona.apellido !== undefined)
      personaPayload.apellido = persona.apellido;
    if (persona.telefono !== undefined)
      personaPayload.telefono = persona.telefono;
    if (persona.estado !== undefined) personaPayload.estado = persona.estado;
    if (Object.keys(personaPayload).length > 0) {
      updateData.persona = { update: personaPayload };
    }
    const actualizado = await this.prisma.docente.update({
      where: { id },
      data: updateData,
      include: { persona: true },
    });
    return serializarDocenteSimple(actualizado);
  }

  async disable(id: number): Promise<DocenteResponse> {
    const actualizado = await this.prisma.docente.update({
      where: { id },
      data: { persona: { update: { estado: 'inactivo' } } },
      include: { persona: true },
    });
    return serializarDocenteSimple(actualizado);
  }

  asignarMateria(docenteId: number, materiaId: number) {
    return this.prisma.docenteMateria.create({
      data: { docenteId, materiaId },
    });
  }

  quitarMateria(docenteId: number, materiaId: number) {
    return this.prisma.docenteMateria.delete({
      where: { docenteId_materiaId: { docenteId, materiaId } },
    });
  }
}
