import { Injectable, NotFoundException } from '@nestjs/common';
import { CalificacionesRepository } from './repositories/calificaciones.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { MateriasRepository } from '../materias/repositories/materias.repository';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';

@Injectable()
export class CalificacionesService {
  constructor(
    private calificacionesRepository: CalificacionesRepository,
    private alumnosRepository: AlumnosRepository,
    private materiasRepository: MateriasRepository,
  ) {}

  async findByAlumno(alumnoId: number) {
    return this.calificacionesRepository.findByAlumno(alumnoId);
  }

  async findByAlumnoYMateria(alumnoId: number, materiaId: number) {
    return this.calificacionesRepository.findByAlumnoYMateria(alumnoId, materiaId);
  }

  async promedio(alumnoId: number) {
    return this.calificacionesRepository.promedioAlumno(alumnoId);
  }

  async promedioPorTrimestre(alumnoId: number) {
    return this.calificacionesRepository.promedioPorTrimestre(alumnoId);
  }

  async promedioPorMateria(alumnoId: number) {
    const data = await this.calificacionesRepository.promedioPorMateria(alumnoId);
    const materias = await this.materiasRepository.findAll(1, 9999);
    return data.map((d: any) => ({
      materia: materias.data.find((m: any) => m.id === d.materiaId),
      promedio: d._avg.nota,
      count: d._count,
    }));
  }

  async create(dto: CrearCalificacionDto) {
    const alumno = await this.alumnosRepository.findById(dto.alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    const materia = await this.materiasRepository.findById(dto.materiaId);
    if (!materia) throw new NotFoundException('Materia no encontrada');
    return this.calificacionesRepository.create(dto);
  }
}