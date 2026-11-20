import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LicenciasService } from './licencias.service';
import { ActualizarLicenciaDto } from './dto/actualizar-licencia.dto';
import type { LicenciasRepository } from './repositories/licencias.repository';
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

// Tests de caracterización (Feathers): verifican lo que el código HACE hoy,
// no lo que debería hacer. Rareza documentada: `finalizada` se computa en
// lectura sin tocar la fila (ver LicenciasService.findByDocente).
function dobleLicencias(filas: Fila[]) {
  const registradas: unknown[] = [];
  const repo = {
    findManyByDocente: async (
      docenteId: number,
    ): Promise<PaginatedResult<LicenciaResponseLike>> => {
      const data = filas
        .filter((f) => f.docenteId === docenteId)
        .map((f) => ({
          ...f,
          fechaInicio: f.fechaInicio.toISOString(),
          fechaFin: f.fechaFin.toISOString(),
        }));
      return {
        data,
        total: data.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    },
    findById: async (id: number) => filas.find((f) => f.id === id) ?? null,
    create: async (data: Record<string, unknown>) => {
      registradas.push(data);
      return { id: filas.length + 1, ...data };
    },
    update: async (id: number, data: ActualizarLicenciaDto) => {
      registradas.push(data);
      return filas.find((f) => f.id === id);
    },
    updateMany: async (args: {
      where: unknown;
      data: Record<string, unknown>;
    }) => {
      registradas.push(args);
      return { count: 1 };
    },
    delete: async (id: number) => {
      const fila = filas.find((f) => f.id === id);
      if (!fila) throw new Error('registro inexistente');
      return fila;
    },
  } as unknown as LicenciasRepository;
  return { repo, registradas };
}

type LicenciaResponseLike = {
  id: number;
  docenteId: number;
  fechaInicio: string;
  fechaFin: string;
  codigo: string;
  motivo: string;
  estado: string;
  observacion: string | null;
};

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

describe('LicenciasService (caracterización)', () => {
  it('create rechaza fechaFin anterior a fechaInicio (400) y no toca el repo', async () => {
    const { repo, registradas } = dobleLicencias([]);
    const service = new LicenciasService(repo);
    await expect(
      service.create({
        docenteId: 10,
        fechaInicio: '2026-07-10',
        fechaFin: '2026-07-01',
        codigo: 'LIC-MED',
        motivo: 'Licencia por enfermedad',
      } as never),
    ).rejects.toThrow(BadRequestException);
    expect(registradas).toHaveLength(0);
  });

  it('create válido delega con fechas convertidas a Date y conserva el estado recibido', async () => {
    const { repo, registradas } = dobleLicencias([]);
    const service = new LicenciasService(repo);
    await service.create({
      docenteId: 10,
      fechaInicio: '2026-07-01',
      fechaFin: '2026-07-10',
      codigo: 'LIC-MED',
      motivo: 'Licencia por enfermedad',
      estado: 'pendiente',
    } as never);
    expect(registradas).toHaveLength(1);
    const data = registradas[0] as Record<string, unknown>;
    expect(data.fechaInicio).toBeInstanceOf(Date);
    expect(data.fechaFin).toBeInstanceOf(Date);
    expect(data.estado).toBe('pendiente');
  });

  it('update combina fechaFin nueva con fechaInicio actual para validar (400)', async () => {
    const { repo } = dobleLicencias([lic({ id: 1, fechaInicio: new Date(2026, 6, 1) })]);
    const service = new LicenciasService(repo);
    await expect(
      service.update(1, { fechaFin: '2026-06-01' } as ActualizarLicenciaDto),
    ).rejects.toThrow(BadRequestException);
  });

  it('update de licencia inexistente lanza NotFoundException', async () => {
    const { repo } = dobleLicencias([]);
    const service = new LicenciasService(repo);
    await expect(
      service.update(99, { fechaFin: '2026-07-10' } as ActualizarLicenciaDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('delete de licencia inexistente lanza NotFoundException', async () => {
    const { repo } = dobleLicencias([]);
    const service = new LicenciasService(repo);
    await expect(service.delete(99)).rejects.toThrow(NotFoundException);
  });

  it('RAREZA: findByDocente computa "finalizada" en lectura sin modificar la fila', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const { repo } = dobleLicencias([lic({ id: 1, estado: 'aprobada', fechaFin: ayer })]);
    const service = new LicenciasService(repo);
    const result = await service.findByDocente(10);
    expect(result.data[0].estado).toBe('finalizada');
  });

  it('RAREZA: "rechazada" vencida NO se computa como finalizada', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const { repo } = dobleLicencias([lic({ id: 1, estado: 'rechazada', fechaFin: ayer })]);
    const service = new LicenciasService(repo);
    const result = await service.findByDocente(10);
    expect(result.data[0].estado).toBe('rechazada');
  });

  it('cron finalizarVencidas apunta a pendiente/aprobada con fechaFin vencida', async () => {
    const { repo, registradas } = dobleLicencias([lic({ id: 1, estado: 'pendiente' })]);
    const service = new LicenciasService(repo);
    await service.finalizarVencidas();
    expect(registradas).toHaveLength(1);
    const args = registradas[0] as {
      where: { fechaFin: { lt: unknown }; estado: { in: string[] } };
      data: { estado: string };
    };
    expect(args.where.fechaFin.lt).toBeInstanceOf(Date);
    expect(args.where.estado.in).toEqual(['pendiente', 'aprobada']);
    expect(args.data.estado).toBe('finalizada');
  });
});
