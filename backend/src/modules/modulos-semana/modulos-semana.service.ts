import { Injectable, NotFoundException } from '@nestjs/common';
import { ModulosSemanaRepository } from './repositories/modulos-semana.repository';
import { CrearModuloSemanaDto } from './dto/crear-modulo-semana.dto';
import { ActualizarModuloSemanaDto } from './dto/actualizar-modulo-semana.dto';
import type {
  ModulosSemanaMesResponse,
  ModuloSemanalResponse,
} from './dto/modulo-semana-response';

@Injectable()
export class ModulosSemanaService {
  constructor(private repo: ModulosSemanaRepository) {}

  findByMes(
    mes: string,
    page = 1,
    limit = 10,
    filtros?: {
      anio?: number;
      division?: string;
      turno?: string;
      materiaId?: number;
    },
  ): Promise<ModulosSemanaMesResponse> {
    return this.repo.findByMes(mes, page, limit, filtros);
  }

  async upsert(dto: CrearModuloSemanaDto): Promise<ModuloSemanalResponse> {
    return this.repo.upsert({
      ...dto,
      semanaInicio: new Date(dto.semanaInicio),
    });
  }

  async update(
    id: number,
    dto: ActualizarModuloSemanaDto,
  ): Promise<ModuloSemanalResponse> {
    const exists = await this.repo.findById(id);
    if (!exists) throw new NotFoundException('Registro semanal no encontrado');
    return this.repo.upsert({
      docenteId: exists.docenteId,
      cursoId: exists.cursoId,
      materiaId: exists.materiaId,
      semanaInicio: new Date(exists.semanaInicio),
      modulosPrevistos: dto.modulosPrevistos ?? exists.modulosPrevistos,
      modulosDictados: dto.modulosDictados ?? exists.modulosDictados,
      factor: dto.factor ?? exists.factor ?? undefined,
      observacion: dto.observacion ?? exists.observacion ?? undefined,
    });
  }

  async delete(id: number) {
    const exists = await this.repo.findById(id);
    if (!exists) throw new NotFoundException('Registro semanal no encontrado');
    return this.repo.delete(id);
  }
}
