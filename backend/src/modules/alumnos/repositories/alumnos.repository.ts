import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearAlumnoDto } from '../dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from '../dto/actualizar-alumno.dto';
import { Prisma } from '@prisma/client';
import type { AlumnoResponse } from '../dto/alumno-response';
import type { InscripcionResponse } from '../../inscripcion/dto/inscripcion-response';
import type { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type AlumnoConRelaciones = Prisma.AlumnoGetPayload<{
  include: {
    persona: true;
    inscripciones: { include: { curso: true } };
    tutores: { include: { persona: true } };
  };
}>;

type TutorAnidado = AlumnoConRelaciones['tutores'][number];

function serializarTutor(tutor: TutorAnidado) {
  return {
    id: tutor.id,
    alumnoId: tutor.alumnoId,
    nombre: tutor.persona.nombre,
    apellido: tutor.persona.apellido,
    dni: tutor.persona.dni ?? '',
  };
}

function serializarAlumno(
  alumno: Omit<AlumnoConRelaciones, 'tutores' | 'inscripciones'> & {
    tutores?: AlumnoConRelaciones['tutores'];
    inscripciones?: AlumnoConRelaciones['inscripciones'];
  },
): AlumnoResponse {
  const inscripciones: InscripcionResponse[] = (alumno.inscripciones ?? []).map(
    (i) => ({
      id: i.id,
      alumnoId: i.alumnoId,
      cursoId: i.cursoId,
      fechaInscripcion: i.fechaInscripcion.toISOString(),
      estado: i.estado,
      curso: i.curso,
    }),
  );
  return {
    id: alumno.id,
    dni: alumno.persona.dni ?? '',
    nombre: alumno.persona.nombre,
    apellido: alumno.persona.apellido,
    nacimiento: alumno.nacimiento.toISOString(),
    direccion: alumno.direccion,
    telefono: alumno.persona.telefono ?? '',
    estado: alumno.persona.estado,
    fechaIngreso: alumno.fechaIngreso.toISOString(),
    fechaEgreso: alumno.fechaEgreso ? alumno.fechaEgreso.toISOString() : null,
    inscripciones,
    tutores: (alumno.tutores ?? []).map(serializarTutor),
  };
}

// Campos de identidad que viven en el supertipo personas
function partirPersona<T extends Partial<CrearAlumnoDto>>(data: T) {
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
export class AlumnosRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResult<AlumnoResponse>> {
    const skip = (page - 1) * limit;
    const where: Prisma.AlumnoWhereInput = {
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
      this.prisma.alumno.findMany({
        skip,
        take: limit,
        where,
        orderBy: { persona: { apellido: 'asc' } },
        include: {
          persona: true,
          inscripciones: { include: { curso: true } },
        },
      }),
      this.prisma.alumno.count({ where }),
    ]);
    const data = rows.map(serializarAlumno);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<AlumnoResponse | null> {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id },
      include: {
        persona: true,
        inscripciones: { include: { curso: true } },
        tutores: { include: { persona: true } },
      },
    });
    return alumno ? serializarAlumno(alumno) : null;
  }

  findByDni(dni: string) {
    return this.prisma.alumno.findFirst({ where: { persona: { dni } } });
  }

  async create(data: CrearAlumnoDto): Promise<AlumnoResponse> {
    const { persona, resto } = partirPersona(data);
    const creado = await this.prisma.alumno.create({
      data: {
        nacimiento: new Date(resto.nacimiento),
        direccion: resto.direccion,
        fechaIngreso: new Date(resto.fechaIngreso),
        fechaEgreso: resto.fechaEgreso ? new Date(resto.fechaEgreso) : null,
        persona: { create: persona as Prisma.PersonaCreateInput },
      },
      include: { persona: true },
    });
    return serializarAlumno(creado);
  }

  async update(id: number, data: ActualizarAlumnoDto): Promise<AlumnoResponse> {
    const { persona, resto } = partirPersona(data);
    const updateData: Prisma.AlumnoUpdateInput = {};
    if (resto.nacimiento) updateData.nacimiento = new Date(resto.nacimiento);
    if (resto.direccion !== undefined) updateData.direccion = resto.direccion;
    if (resto.fechaIngreso)
      updateData.fechaIngreso = new Date(resto.fechaIngreso);
    if (resto.fechaEgreso !== undefined) {
      updateData.fechaEgreso = resto.fechaEgreso
        ? new Date(resto.fechaEgreso)
        : null;
    }
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
    const actualizado = await this.prisma.alumno.update({
      where: { id },
      data: updateData,
      include: { persona: true },
    });
    return serializarAlumno(actualizado);
  }

  async disable(id: number): Promise<AlumnoResponse> {
    const actualizado = await this.prisma.alumno.update({
      where: { id },
      data: { persona: { update: { estado: 'inactivo' } } },
      include: { persona: true },
    });
    return serializarAlumno(actualizado);
  }
}
