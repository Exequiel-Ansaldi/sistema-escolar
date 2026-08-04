import { Module } from '@nestjs/common';
import { CursosController } from './cursos.controller';
import { CursoMateriaController } from './curso-materia.controller';
import { CursosService } from './cursos.service';
import { CursoMateriaService } from './curso-materia.service';
import { CursosRepository } from './repositories/cursos.repository';
import { CursoMateriaRepository } from './repositories/curso-materia.repository';

@Module({
  controllers: [CursosController, CursoMateriaController],
  providers: [
    CursosService,
    CursoMateriaService,
    CursosRepository,
    CursoMateriaRepository,
  ],
  exports: [CursosService, CursosRepository],
})
export class CursosModule {}
