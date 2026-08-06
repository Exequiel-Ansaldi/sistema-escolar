import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModulosMensualesRepository } from './repositories/modulos-mensuales.repository';
import { CrearModuloMensualDto } from './dto/crear-modulo-mensual.dto';
import { ActualizarModuloMensualDto } from './dto/actualizar-modulo-mensual.dto';
import type {
  ModulosMensualesMesResponse,
  ModuloMensualResponse,
} from './dto/modulo-mensual-response';

function mesAFecha(mes: string): Date {
  const [y, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

function validarNoDictados(
  modulosPrevistos: number,
  modulosDictados: number,
  noDictados?: { cantidad: number }[],
) {
  const sumaNoDictados =
    noDictados?.reduce((acc, n) => acc + n.cantidad, 0) ?? 0;
  if (modulosDictados + sumaNoDictados !== modulosPrevistos) {
    throw new BadRequestException(
      'La suma de módulos no dictados no coincide con la diferencia (previstos - dictados)',
    );
  }
}

@Injectable()
export class ModulosMensualesService {
  constructor(private repo: ModulosMensualesRepository) {}

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
  ): Promise<ModulosMensualesMesResponse> {
    return this.repo.findByMes(mes, page, limit, filtros);
  }

  async upsert(dto: CrearModuloMensualDto): Promise<ModuloMensualResponse> {
    validarNoDictados(
      dto.modulosPrevistos,
      dto.modulosDictados,
      dto.noDictados,
    );
    return this.repo.upsert({
      ...dto,
      mes: mesAFecha(dto.mes),
    });
  }

  async update(
    id: number,
    dto: ActualizarModuloMensualDto,
  ): Promise<ModuloMensualResponse> {
    const exists = await this.repo.findById(id);
    if (!exists) throw new NotFoundException('Registro mensual no encontrado');
    const modulosPrevistos = dto.modulosPrevistos ?? exists.modulosPrevistos;
    const modulosDictados = dto.modulosDictados ?? exists.modulosDictados;
    validarNoDictados(modulosPrevistos, modulosDictados, dto.noDictados);
    return this.repo.update(id, {
      modulosPrevistos,
      modulosDictados,
      noDictados: dto.noDictados,
      observacion: dto.observacion ?? exists.observacion ?? undefined,
    });
  }

  async delete(id: number) {
    const exists = await this.repo.findById(id);
    if (!exists) throw new NotFoundException('Registro mensual no encontrado');
    return this.repo.delete(id);
  }
}
