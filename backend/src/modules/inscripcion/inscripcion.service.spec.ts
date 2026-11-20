import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { InscripcionService } from './inscripcion.service';
import { InscripcionRepository } from './repositories/inscripcion.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { CursosRepository } from '../cursos/repositories/cursos.repository';

class InscripcionRepositoryMock {
  static existentes: { alumnoId: number; cursoId: number }[] = [];
  static creados: unknown[] = [];
  async findAll() {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
  async findByAlumnoYCurso(alumnoId: number, cursoId: number) {
    return InscripcionRepositoryMock.existentes.some(
      (e) => e.alumnoId === alumnoId && e.cursoId === cursoId,
    )
      ? { id: 1, alumnoId, cursoId }
      : null;
  }
  async create(data: unknown) {
    InscripcionRepositoryMock.creados.push(data);
    return { id: 50, ...(data as object) };
  }
  async delete(alumnoId: number, cursoId: number) {
    InscripcionRepositoryMock.creados.push({ delete: { alumnoId, cursoId } });
    return { id: 50, alumnoId, cursoId };
  }
}

class AlumnosRepositoryMock {
  static ids = [1];
  async findById(id: number) {
    return AlumnosRepositoryMock.ids.includes(id) ? { id } : null;
  }
}

class CursosRepositoryMock {
  static ids = [10];
  async findById(id: number) {
    return CursosRepositoryMock.ids.includes(id) ? { id } : null;
  }
}

describe('InscripcionService', () => {
  let service: InscripcionService;

  beforeEach(async () => {
    InscripcionRepositoryMock.existentes = [];
    InscripcionRepositoryMock.creados = [];
    AlumnosRepositoryMock.ids = [1];
    CursosRepositoryMock.ids = [10];
    const module = await Test.createTestingModule({
      providers: [
        InscripcionService,
        { provide: InscripcionRepository, useClass: InscripcionRepositoryMock },
        { provide: AlumnosRepository, useClass: AlumnosRepositoryMock },
        { provide: CursosRepository, useClass: CursosRepositoryMock },
      ],
    }).compile();
    service = module.get(InscripcionService);
  });

  it('inscribir: alumno inexistente → 404', async () => {
    await expect(
      service.inscribir({ alumnoId: 99, cursoId: 10 } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('inscribir: curso inexistente → 404', async () => {
    await expect(
      service.inscribir({ alumnoId: 1, cursoId: 99 } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('inscribir: duplicado (alumno, curso) → 409', async () => {
    InscripcionRepositoryMock.existentes = [{ alumnoId: 1, cursoId: 10 }];
    await expect(
      service.inscribir({ alumnoId: 1, cursoId: 10 } as never),
    ).rejects.toThrow(ConflictException);
  });

  it('inscribir: par nuevo delega en el repositorio', async () => {
    const resultado = await service.inscribir({
      alumnoId: 1,
      cursoId: 10,
    } as never);
    expect(resultado).toMatchObject({ id: 50, alumnoId: 1, cursoId: 10 });
  });

  it('desinscribir: inscripción inexistente → 404', async () => {
    await expect(service.desinscribir(1, 99)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('desinscribir: existente delega el borrado', async () => {
    InscripcionRepositoryMock.existentes = [{ alumnoId: 1, cursoId: 10 }];
    await service.desinscribir(1, 10);
    expect(InscripcionRepositoryMock.creados[0]).toEqual({
      delete: { alumnoId: 1, cursoId: 10 },
    });
  });
});
