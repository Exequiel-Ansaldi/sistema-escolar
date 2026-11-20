import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ModulosMensualesService } from './modulos-mensuales.service';
import { ModulosMensualesRepository } from './repositories/modulos-mensuales.repository';

class ModulosMensualesRepositoryMock {
  static registros: Record<number, { modulosPrevistos: number; modulosDictados: number; observacion: string | null }> = {};
  static persistidos: unknown[] = [];
  async findByMes() {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0, totalPrevistos: 0, totalDictados: 0 };
  }
  async findById(id: number) {
    return ModulosMensualesRepositoryMock.registros[id] ?? null;
  }
  async upsert(data: unknown) {
    ModulosMensualesRepositoryMock.persistidos.push(data);
    return { id: 1, ...(data as object) };
  }
  async update(id: number, data: unknown) {
    ModulosMensualesRepositoryMock.persistidos.push({ id, ...data });
    return { id, ...(data as object) };
  }
  async delete(id: number) {
    ModulosMensualesRepositoryMock.persistidos.push({ delete: id });
    return { id };
  }
}

describe('ModulosMensualesService — invariante de cierre (modulosDictados + Σ noDictados = previstos)', () => {
  let service: ModulosMensualesService;

  beforeEach(async () => {
    ModulosMensualesRepositoryMock.registros = {};
    ModulosMensualesRepositoryMock.persistidos = [];
    const module = await Test.createTestingModule({
      providers: [
        ModulosMensualesService,
        {
          provide: ModulosMensualesRepository,
          useClass: ModulosMensualesRepositoryMock,
        },
      ],
    }).compile();
    service = module.get(ModulosMensualesService);
  });

  it.each([
    { previstos: 20, dictados: 20, noDictados: undefined, valido: true },
    { previstos: 20, dictados: 18, noDictados: [{ cantidad: 2 }], valido: true },
    { previstos: 20, dictados: 10, noDictados: [{ cantidad: 4 }, { cantidad: 6 }], valido: true },
    { previstos: 20, dictados: 20, noDictados: [], valido: true },
    { previstos: 20, dictados: 18, noDictados: undefined, valido: false }, // sin desglose no cierra
    { previstos: 20, dictados: 18, noDictados: [{ cantidad: 1 }], valido: false },
    { previstos: 20, dictados: 10, noDictados: [{ cantidad: 5 }], valido: false },
    { previstos: 20, dictados: 25, noDictados: undefined, valido: false },
  ])('upsert previstos=$previstos dictados=$dictados Σ=$noDictados → válido=$valido', async ({ previstos, dictados, noDictados, valido }) => {
    const dto = {
      docenteId: 1,
      cursoId: 2,
      materiaId: 3,
      mes: '2026-07-01',
      modulosPrevistos: previstos,
      modulosDictados: dictados,
      noDictados,
    } as never;
    if (valido) {
      await expect(service.upsert(dto)).resolves.toBeDefined();
    } else {
      await expect(service.upsert(dto)).rejects.toThrow(BadRequestException);
    }
  });

  it('update: registro inexistente → 404', async () => {
    await expect(service.update(99, {} as never)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update: valida la invariante combinando valores nuevos con existentes', async () => {
    ModulosMensualesRepositoryMock.registros[1] = {
      modulosPrevistos: 20,
      modulosDictados: 10,
      observacion: null,
    };
    // solo cambia dictados a 12 → Σ noDictados ausente = 0 → 12 ≠ 20 → 400
    await expect(
      service.update(1, { modulosDictados: 12 } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('delete: registro inexistente → 404', async () => {
    await expect(service.delete(99)).rejects.toThrow(NotFoundException);
  });
});
