import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LicenciasRepository } from './repositories/licencias.repository';

@Injectable()
export class LicenciasService {
  constructor(private licenciasRepository: LicenciasRepository) {}

  async findByDocente(docenteId: number) {
    const licencias = await this.licenciasRepository.findManyByDocente(docenteId);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return licencias.map(l => {
      const fin = new Date(l.fechaFin);
      fin.setHours(0, 0, 0, 0);
      return {
        ...l,
        estado: fin <= hoy && l.estado !== 'rechazada' ? 'finalizada' : l.estado,
      };
    });
  }

  @Cron('0 0 * * *')
  async finalizarVencidas() {
    const now = new Date();
    await this.licenciasRepository.updateMany({
      where: { fechaFin: { lt: now }, estado: { in: ['pendiente', 'aprobada'] } },
      data: { estado: 'finalizada' },
    });
  }

  async create(body: any) {
    const inicio = new Date(body.fechaInicio);
    const fin = new Date(body.fechaFin);
    if (fin < inicio) throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    return this.licenciasRepository.create({
      ...body,
      fechaInicio: inicio,
      fechaFin: fin,
    });
  }

  async update(id: number, body: any) {
    const data: any = { ...body };
    if (body.fechaInicio) data.fechaInicio = new Date(body.fechaInicio);
    if (body.fechaFin) data.fechaFin = new Date(body.fechaFin);
    if (body.fechaFin || body.fechaInicio) {
      const actual = await this.licenciasRepository.findById(id);
      if (!actual) throw new NotFoundException('Licencia no encontrada');
      const inicio = data.fechaInicio ?? actual.fechaInicio;
      const fin = data.fechaFin ?? actual.fechaFin;
      if (fin < inicio) throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    return this.licenciasRepository.update(id, data);
  }

  async delete(id: number) {
    const licencia = await this.licenciasRepository.findById(id);
    if (!licencia) throw new NotFoundException('Licencia no encontrada');
    return this.licenciasRepository.delete(id);
  }
}
