import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MateriasRepository } from './repositories/materias.repository';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';

@Injectable()
export class MateriasService {
  constructor(private materiasRepository: MateriasRepository) {}

  async findAll(page = 1, limit = 10) { return this.materiasRepository.findAll(page, limit); }

  async findById(id: number) {
    const m = await this.materiasRepository.findById(id);
    if (!m) throw new NotFoundException('Materia no encontrada');
    return m;
  }

  async create(dto: CrearMateriaDto) {
    const existente = await this.materiasRepository.findByNombre(dto.nombre);
    if (existente) throw new ConflictException('Ya existe una materia con ese nombre');
    return this.materiasRepository.create(dto);
  }

  async update(id: number, dto: ActualizarMateriaDto) {
    await this.findById(id);
    if (dto.nombre) {
      const duplicado = await this.materiasRepository.findByNombre(dto.nombre);
      if (duplicado && duplicado.id !== id) throw new ConflictException('Ya existe una materia con ese nombre');
    }
    return this.materiasRepository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    return this.materiasRepository.delete(id);
  }
}