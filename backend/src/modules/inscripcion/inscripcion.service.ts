import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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

    return this.inscripcionRepository.create(dto);
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
