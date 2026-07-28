import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CursosRepository } from './repositories/cursos.repository';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';

@Injectable()
export class CursosService {
  constructor(private cursosRepository: CursosRepository) {}

  async findAll() {
    return this.cursosRepository.findAll();
  }

  async findById(id: number) {
    const curso = await this.cursosRepository.findById(id);
    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }

  async create(dto: CrearCursoDto) {
    const existing = await this.cursosRepository.findByAnioDivisionTurno(dto.anio, dto.division, dto.turno);
    if (existing) throw new ConflictException(`Ya existe un curso ${dto.anio}°${dto.division} - ${dto.turno}`);
    return this.cursosRepository.create(dto);
  }

  async update(id: number, dto: ActualizarCursoDto) {
    const curso = await this.findById(id);
    const anio = dto.anio ?? curso.anio;
    const division = dto.division ?? curso.division;
    const turno = dto.turno ?? curso.turno;
    const existing = await this.cursosRepository.findByAnioDivisionTurno(anio, division, turno);
    if (existing && existing.id !== id) throw new ConflictException(`Ya existe un curso ${anio}°${division} - ${turno}`);
    return this.cursosRepository.update(id, dto);
  }

  async disable(id: number) {
    await this.findById(id);
    return this.cursosRepository.disable(id);
  }
}