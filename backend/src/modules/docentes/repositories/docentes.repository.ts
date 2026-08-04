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
  include: { materias: { include: { materia: true } }; licencias: true };
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
    dni: docente.dni,
    nombre: docente.nombre,
    apellido: docente.apellido,
    telefono: docente.telefono,
    email: docente.email,
    fechaIngreso: docente.fechaIngreso.toISOString(),
    estado: docente.estado,
    materias,
    licencias,
  };
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
    const where: Prisma.DocenteWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.docente.findMany({
        skip,
        take: limit,
        where,
        orderBy: { apellido: 'asc' },
      }),
      this.prisma.docente.count({ where }),
    ]);
    const data = rows.map((d) => ({
      id: d.id,
      dni: d.dni,
      nombre: d.nombre,
      apellido: d.apellido,
      telefono: d.telefono,
      email: d.email,
      fechaIngreso: d.fechaIngreso.toISOString(),
      estado: d.estado,
    }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<DocenteDetalleResponse | null> {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: { materias: { include: { materia: true } }, licencias: true },
    });
    return docente ? serializarDocente(docente) : null;
  }

  findByEmail(email: string) {
    return this.prisma.docente.findUnique({ where: { email } });
  }

  findByDni(dni: string) {
    return this.prisma.docente.findUnique({ where: { dni } });
  }

  create(data: CrearDocenteDto) {
    return this.prisma.docente.create({
      data: { ...data, fechaIngreso: new Date(data.fechaIngreso) },
    });
  }

  update(id: number, data: ActualizarDocenteDto) {
    const updateData: Prisma.DocenteUpdateInput = { ...data };
    if (data.fechaIngreso)
      updateData.fechaIngreso = new Date(data.fechaIngreso);
    return this.prisma.docente.update({ where: { id }, data: updateData });
  }

  disable(id: number) {
    return this.prisma.docente.update({
      where: { id },
      data: { estado: 'inactivo' },
    });
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
