import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AlumnosRepository } from './repositories/alumnos.repository';
import { CrearAlumnoDto } from './dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from './dto/actualizar-alumno.dto';

@Injectable()
export class AlumnosService {
  constructor(private alumnosRepository: AlumnosRepository) {}

  async findAll(page = 1, limit = 10, search?: string) {
    return this.alumnosRepository.findAll(page, limit, search);
  }

  async findById(id: number) {
    const alumno = await this.alumnosRepository.findById(id);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    return alumno;
  }

  async create(dto: CrearAlumnoDto) {
    const existente = await this.alumnosRepository.findByDni(dto.dni);
    if (existente) throw new ConflictException('Ya existe un alumno con ese DNI');
    return this.alumnosRepository.create(dto);
  }

  async update(id: number, dto: ActualizarAlumnoDto) {
    await this.findById(id);
    if (dto.dni) {
      const existente = await this.alumnosRepository.findByDni(dto.dni);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe otro alumno con ese DNI');
      }
    }
    return this.alumnosRepository.update(id, dto);
  }

  async disable(id: number) {
    await this.findById(id);
    return this.alumnosRepository.disable(id);
  }
}
