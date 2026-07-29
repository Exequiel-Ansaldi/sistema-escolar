import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DocentesRepository } from './repositories/docentes.repository';
import { MateriasRepository } from '../materias/repositories/materias.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';

@Injectable()
export class DocentesService {
  constructor(
    private docentesRepository: DocentesRepository,
    private materiasRepository: MateriasRepository,
    private prisma: PrismaService,
  ) {}

  async findAll(page = 1, limit = 10) { return this.docentesRepository.findAll(page, limit); }

  async findById(id: number) {
    const d = await this.docentesRepository.findById(id);
    if (!d) throw new NotFoundException('Docente no encontrado');
    return d;
  }

  async create(dto: CrearDocenteDto) {
    const existenteEmail = await this.docentesRepository.findByEmail(dto.email);
    if (existenteEmail) throw new ConflictException('Ya existe un docente con ese email');
    const existenteDni = await this.docentesRepository.findByDni(dto.dni);
    if (existenteDni) throw new ConflictException(`Ya existe un docente con DNI ${dto.dni}`);
    if (new Date(dto.fechaIngreso) > new Date()) throw new ConflictException('La fecha de ingreso no puede ser posterior a hoy');
    return this.docentesRepository.create(dto);
  }

  async update(id: number, dto: ActualizarDocenteDto) {
    await this.findById(id);
    if (dto.email) {
      const existente = await this.docentesRepository.findByEmail(dto.email);
      if (existente && existente.id !== id) throw new ConflictException('Email en uso');
    }
    if (dto.dni) {
      const existente = await this.docentesRepository.findByDni(dto.dni);
      if (existente && existente.id !== id) throw new ConflictException(`DNI ${dto.dni} ya registrado`);
    }
    if (dto.fechaIngreso && new Date(dto.fechaIngreso) > new Date()) throw new ConflictException('La fecha de ingreso no puede ser posterior a hoy');
    return this.docentesRepository.update(id, dto);
  }

  async disable(id: number) {
    await this.findById(id);
    return this.docentesRepository.disable(id);
  }

  async asignarMateria(dto: AsignarMateriaDto) {
    const docente = await this.docentesRepository.findById(dto.docenteId);
    if (!docente) throw new NotFoundException('Docente no encontrado');
    const materia = await this.materiasRepository.findById(dto.materiaId);
    if (!materia) throw new NotFoundException('Materia no encontrada');
    return this.prisma.docenteMateria.create({ data: dto });
  }

  async quitarMateria(dto: AsignarMateriaDto) {
    return this.prisma.docenteMateria.delete({
      where: { docenteId_materiaId: { docenteId: dto.docenteId, materiaId: dto.materiaId } },
    });
  }
}