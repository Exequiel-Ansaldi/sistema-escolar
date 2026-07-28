import { Injectable, NotFoundException } from '@nestjs/common';
import { ModulosSemanaRepository } from './modulos-semana.repository';

@Injectable()
export class ModulosSemanaService {
  constructor(private repo: ModulosSemanaRepository) {}

  findByMes(mes: string) {
    return this.repo.findByMes(mes);
  }

  async upsert(body: {
    docenteId: number; cursoId: number; materiaId: number; semanaInicio: string;
    modulosPrevistos: number; modulosDictados: number; factor?: string; observacion?: string;
  }) {
    return this.repo.upsert({
      ...body,
      semanaInicio: new Date(body.semanaInicio),
    });
  }

  async update(id: number, body: Partial<{
    modulosPrevistos: number; modulosDictados: number; factor?: string; observacion?: string;
  }>) {
    const exists = await this.repo.findById(id);
    if (!exists) throw new NotFoundException('Registro semanal no encontrado');
    return this.repo.upsert({
      docenteId: exists.docenteId, cursoId: exists.cursoId, materiaId: exists.materiaId,
      semanaInicio: exists.semanaInicio,
      modulosPrevistos: body.modulosPrevistos ?? exists.modulosPrevistos,
      modulosDictados: body.modulosDictados ?? exists.modulosDictados,
      factor: body.factor ?? exists.factor ?? undefined,
      observacion: body.observacion ?? exists.observacion ?? undefined,
    });
  }

  async delete(id: number) {
    const exists = await this.repo.findById(id);
    if (!exists) throw new NotFoundException('Registro semanal no encontrado');
    return this.repo.delete(id);
  }
}
