import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InscripcionRepository } from './repositories/inscripcion.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { CursosRepository } from '../cursos/repositories/cursos.repository';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';

@Injectable()
export class InscripcionService {
  constructor(
    private inscripcionRepository: InscripcionRepository,
    private alumnosRepository: AlumnosRepository,
    private cursosRepository: CursosRepository,
  ) {}

  findAll(
    page = 1,
    limit = 10,
    filtros?: { anio?: number; division?: string; turno?: string },
  ) {
    return this.inscripcionRepository.findAll(page, limit, filtros);
  }

  async inscribir(dto: CrearInscripcionDto) {
    const alumno = await this.alumnosRepository.findById(dto.alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const curso = await this.cursosRepository.findById(dto.cursoId);
    if (!curso) throw new NotFoundException('Curso no encontrado');

    const existente = await this.inscripcionRepository.findByAlumnoYCurso(
      dto.alumnoId,
      dto.cursoId,
    );
    if (existente)
      throw new ConflictException('El alumno ya está inscrito en este curso');

    try {
      return await this.inscripcionRepository.create(dto);
    } catch (e) {
      // Carrera paralela: dos inscripciones simultáneas del mismo par superan
      // el chequeo previo; la restricción única de la base define el 409.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('El alumno ya está inscrito en este curso');
      }
      throw e;
    }
  }

  async desinscribir(alumnoId: number, cursoId: number) {
    const inscripcion = await this.inscripcionRepository.findByAlumnoYCurso(
      alumnoId,
      cursoId,
    );
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    return this.inscripcionRepository.delete(alumnoId, cursoId);
  }
}
