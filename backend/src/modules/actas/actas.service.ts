import { Injectable } from '@nestjs/common';
import { ActasRepository, AcuerdosRepository, SeguimientoRepository, TutoresRepository } from './repositories/actas.repository';

@Injectable()
export class ActasService {
  constructor(private repo: ActasRepository) {}
  findByAlumno(alumnoId: number) { return this.repo.findByAlumno(alumnoId); }
  create(data: any) { return this.repo.create(data); }
}

@Injectable()
export class AcuerdosService {
  constructor(private repo: AcuerdosRepository) {}
  findByAlumno(alumnoId: number) { return this.repo.findByAlumno(alumnoId); }
  create(data: any) { return this.repo.create(data); }
  update(id: number, data: any) { return this.repo.update(id, data); }
}

@Injectable()
export class SeguimientoService {
  constructor(private repo: SeguimientoRepository) {}
  findByAlumno(alumnoId: number) { return this.repo.findByAlumno(alumnoId); }
  create(data: any) { return this.repo.create(data); }
}

@Injectable()
export class TutoresService {
  constructor(private repo: TutoresRepository) {}
  findByAlumno(alumnoId: number) { return this.repo.findByAlumno(alumnoId); }
  create(data: any) { return this.repo.create(data); }
  delete(id: number) { return this.repo.delete(id); }
}
