import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LicenciasRepository } from './repositories/licencias.repository';
import { CrearLicenciaDto } from './dto/crear-licencia.dto';
import { ActualizarLicenciaDto } from './dto/actualizar-licencia.dto';
import type { LicenciaResponse } from './dto/licencia-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class LicenciasService {
  constructor(private licenciasRepository: LicenciasRepository) {}

  async findByDocente(
    docenteId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<LicenciaResponse>> {
    const result = await this.licenciasRepository.findManyByDocente(
      docenteId,
      page,
      limit,
    );
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return {
      ...result,
      data: result.data.map((l) => {
        const fin = new Date(l.fechaFin);
        fin.setHours(0, 0, 0, 0);
        return {
          ...l,
          estado:
            fin <= hoy && l.estado !== 'rechazada' ? 'finalizada' : l.estado,
        };
      }),
    };
  }

  @Cron('0 0 * * *')
  async finalizarVencidas() {
    const now = new Date();
    await this.licenciasRepository.updateMany({
      where: {
        fechaFin: { lt: now },
        estado: { in: ['pendiente', 'aprobada'] },
      },
      data: { estado: 'finalizada' },
    });
  }

  async create(dto: CrearLicenciaDto) {
    const inicio = new Date(dto.fechaInicio);
    const fin = new Date(dto.fechaFin);
    if (fin < inicio)
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    return this.licenciasRepository.create({
      ...dto,
      fechaInicio: inicio,
      fechaFin: fin,
    });
  }

  async update(id: number, dto: ActualizarLicenciaDto) {
    if (dto.fechaFin || dto.fechaInicio) {
      const actual = await this.licenciasRepository.findById(id);
      if (!actual) throw new NotFoundException('Licencia no encontrada');
      const inicio = dto.fechaInicio
        ? new Date(dto.fechaInicio)
        : actual.fechaInicio;
      const fin = dto.fechaFin ? new Date(dto.fechaFin) : actual.fechaFin;
      if (fin < inicio)
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio',
        );
    }
    return this.licenciasRepository.update(id, dto);
  }

  async delete(id: number) {
    const licencia = await this.licenciasRepository.findById(id);
    if (!licencia) throw new NotFoundException('Licencia no encontrada');
    return this.licenciasRepository.delete(id);
  }
}
