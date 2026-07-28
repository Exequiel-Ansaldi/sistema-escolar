import { Module } from '@nestjs/common';
import { CursosController } from './cursos.controller';
import { CursoMateriaController } from './curso-materia.controller';
import { CursosService } from './cursos.service';
import { CursoMateriaService } from './curso-materia.service';
import { CursosRepository } from './repositories/cursos.repository';

@Module({
  controllers: [CursosController, CursoMateriaController],
  providers: [CursosService, CursoMateriaService, CursosRepository],
  exports: [CursosService, CursosRepository],
})
export class CursosModule {}
