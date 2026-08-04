import { Injectable, NotFoundException } from '@nestjs/common';
import { CalificacionesRepository } from './repositories/calificaciones.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { MateriasRepository } from '../materias/repositories/materias.repository';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import type { PromedioPorMateriaResponse } from './dto/calificacion-response';

@Injectable()
export class CalificacionesService {
  constructor(
    private calificacionesRepository: CalificacionesRepository,
    private alumnosRepository: AlumnosRepository,
    private materiasRepository: MateriasRepository,
  ) {}

  async findByAlumno(alumnoId: number, page = 1, limit = 10) {
    return this.calificacionesRepository.findByAlumno(alumnoId, page, limit);
  }

  async findByAlumnoYMateria(alumnoId: number, materiaId: number) {
    return this.calificacionesRepository.findByAlumnoYMateria(
      alumnoId,
      materiaId,
    );
  }

  async promedio(alumnoId: number) {
    return this.calificacionesRepository.promedioAlumno(alumnoId);
  }

  async promedioPorTrimestre(alumnoId: number) {
    return this.calificacionesRepository.promedioPorTrimestre(alumnoId);
  }

  async promedioPorMateria(
    alumnoId: number,
  ): Promise<PromedioPorMateriaResponse[]> {
    const data =
      await this.calificacionesRepository.promedioPorMateria(alumnoId);
    const materias = await this.materiasRepository.findAll(1, 9999);
    return data.map((d) => ({
      materiaId: d.materiaId,
      promedio: d._avg.nota,
      count: d._count,
      materia: materias.data.find((m) => m.id === d.materiaId),
    }));
  }

  async create(dto: CrearCalificacionDto) {
    const alumno = await this.alumnosRepository.findById(dto.alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    const materia = await this.materiasRepository.findById(dto.materiaId);
    if (!materia) throw new NotFoundException('Materia no encontrada');
    return this.calificacionesRepository.create(dto);
  }

  async update(id: number, dto: Partial<CrearCalificacionDto>) {
    const existe = await this.calificacionesRepository.findById(id);
    if (!existe) throw new NotFoundException('Calificación no encontrada');
    return this.calificacionesRepository.update(id, dto);
  }
}
