import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LicenciasService } from './licencias.service';
import { LicenciasRepository } from './repositories/licencias.repository';
import { ActualizarLicenciaDto } from './dto/actualizar-licencia.dto';
import type { LicenciaResponse } from './dto/licencia-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

type Fila = {
  id: number;
  docenteId: number;
  fechaInicio: Date;
  fechaFin: Date;
  codigo: string;
  motivo: string;
  estado: string;
  observacion: string | null;
};

// Mock del repositorio (patrón de la cátedra: clase reutilizable + overrideProvider).
// El estado es estático y se resetea en cada test para cumplir FIRST.
class LicenciasRepositoryMock {
  static filas: Fila[] = [];
  static registradas: unknown[] = [];

  async findManyByDocente(
    docenteId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<LicenciaResponse>> {
    const data = LicenciasRepositoryMock.filas
      .filter((f) => f.docenteId === docenteId)
      .slice((page - 1) * limit, page * limit)
      .map((f) => ({
        ...f,
        fechaInicio: f.fechaInicio.toISOString(),
        fechaFin: f.fechaFin.toISOString(),
      }));
    return { data, total: data.length, page, limit, totalPages: 1 };
  }

  async findById(id: number) {
    return LicenciasRepositoryMock.filas.find((f) => f.id === id) ?? null;
  }

  async create(data: Record<string, unknown>) {
    LicenciasRepositoryMock.registradas.push(data);
    return { id: 100, ...data };
  }

  async update(id: number, data: ActualizarLicenciaDto) {
    LicenciasRepositoryMock.registradas.push(data);
    return LicenciasRepositoryMock.filas.find((f) => f.id === id);
  }

  async updateMany(args: { where: unknown; data: Record<string, unknown> }) {
    LicenciasRepositoryMock.registradas.push(args);
    return { count: 1 };
  }

  async delete(id: number) {
    const fila = LicenciasRepositoryMock.filas.find((f) => f.id === id);
    if (!fila) throw new Error('registro inexistente');
    return fila;
  }
}

function lic(parcial: Partial<Fila>): Fila {
  return {
    id: 1,
    docenteId: 10,
    fechaInicio: new Date(2026, 6, 1),
    fechaFin: new Date(2026, 6, 10),
    codigo: 'LIC-MED',
    motivo: 'Licencia por enfermedad',
    estado: 'aprobada',
    observacion: null,
    ...parcial,
  };
}

describe('LicenciasService', () => {
  let service: LicenciasService;

  beforeEach(async () => {
    LicenciasRepositoryMock.filas = [];
    LicenciasRepositoryMock.registradas = [];
    const module = await Test.createTestingModule({
      providers: [
        LicenciasService,
        { provide: LicenciasRepository, useClass: LicenciasRepositoryMock },
      ],
    }).compile();
    service = module.get(LicenciasService);
  });

  it('create rechaza fechaFin anterior a fechaInicio (400) y no toca el repo', async () => {
    await expect(
      service.create({
        docenteId: 10,
        fechaInicio: '2026-07-10',
        fechaFin: '2026-07-01',
        codigo: 'LIC-MED',
        motivo: 'Licencia por enfermedad',
      } as never),
    ).rejects.toThrow(BadRequestException);
    expect(LicenciasRepositoryMock.registradas).toHaveLength(0);
  });

  it('create válido delega con fechas convertidas a Date y conserva el estado recibido', async () => {
    await service.create({
      docenteId: 10,
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-10',
      codigo: 'LIC-MED',
      motivo: 'Licencia por enfermedad',
      estado: 'pendiente',
    } as never);
    expect(LicenciasRepositoryMock.registradas).toHaveLength(1);
    const data = LicenciasRepositoryMock.registradas[0] as Record<string, unknown>;
    expect(data.fechaInicio).toBeInstanceOf(Date);
    expect(data.fechaFin).toBeInstanceOf(Date);
    expect(data.estado).toBe('pendiente');
  });

  it('update combina fechaFin nueva con fechaInicio actual para validar (400)', async () => {
    LicenciasRepositoryMock.filas = [lic({ id: 1, fechaInicio: new Date(2026, 6, 1) })];
    await expect(
      service.update(1, { fechaFin: '2026-06-01' } as ActualizarLicenciaDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('update de licencia inexistente lanza NotFoundException', async () => {
    await expect(
      service.update(99, { fechaFin: '2026-07-10' } as ActualizarLicenciaDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('delete de licencia inexistente lanza NotFoundException', async () => {
    await expect(service.delete(99)).rejects.toThrow(NotFoundException);
  });

  it('RAREZA: findByDocente computa "finalizada" en lectura sin modificar la fila', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    LicenciasRepositoryMock.filas = [
      lic({ id: 1, estado: 'aprobada', fechaFin: ayer }),
    ];
    const result = await service.findByDocente(10);
    expect(result.data[0].estado).toBe('finalizada');
  });

  it('RAREZA: "rechazada" vencida NO se computa como finalizada', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    LicenciasRepositoryMock.filas = [
      lic({ id: 1, estado: 'rechazada', fechaFin: ayer }),
    ];
    const result = await service.findByDocente(10);
    expect(result.data[0].estado).toBe('rechazada');
  });

  it('cron finalizarVencidas apunta a pendiente/aprobada con fechaFin vencida', async () => {
    LicenciasRepositoryMock.filas = [lic({ id: 1, estado: 'pendiente' })];
    await service.finalizarVencidas();
    expect(LicenciasRepositoryMock.registradas).toHaveLength(1);
    const args = LicenciasRepositoryMock.registradas[0] as {
      where: { fechaFin: { lt: unknown }; estado: { in: string[] } };
      data: { estado: string };
    };
    expect(args.where.fechaFin.lt).toBeInstanceOf(Date);
    expect(args.where.estado.in).toEqual(['pendiente', 'aprobada']);
    expect(args.data.estado).toBe('finalizada');
  });

  describe('transiciones de estado (State)', () => {
    it.each([
      ['pendiente', 'aprobada', true],
      ['pendiente', 'rechazada', true],
      ['aprobada', 'finalizada', true],
      ['aprobada', 'aprobada', true], // no-op a sí mismo (el form guarda el estado actual)
      ['pendiente', 'finalizada', false], // salto de etapa
      ['aprobada', 'pendiente', false], // hacia atrás
      ['rechazada', 'aprobada', false], // terminal
      ['finalizada', 'aprobada', false], // terminal
    ])('%s → %s: válido = %p', async (desde, hacia, valido) => {
      LicenciasRepositoryMock.filas = [lic({ id: 1, estado: desde })];
      if (valido) {
        await expect(
          service.update(1, { estado: hacia } as ActualizarLicenciaDto),
        ).resolves.toBeDefined();
      } else {
        await expect(
          service.update(1, { estado: hacia } as ActualizarLicenciaDto),
        ).rejects.toThrow(BadRequestException);
      }
    });

    it('update rechaza estado desconocido (400)', async () => {
      LicenciasRepositoryMock.filas = [lic({ id: 1, estado: 'pendiente' })];
      await expect(
        service.update(1, { estado: 'cancelada' } as ActualizarLicenciaDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
