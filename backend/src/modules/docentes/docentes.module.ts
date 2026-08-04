import { Module } from '@nestjs/common';
import { DocentesController } from './docentes.controller';
import { DocenteMateriaController } from './docente-materia.controller';
import { DocentesService } from './docentes.service';
import { DocentesRepository } from './repositories/docentes.repository';
import { MateriasModule } from '../materias/materias.module';

@Module({
  imports: [MateriasModule],
  controllers: [DocentesController, DocenteMateriaController],
  providers: [DocentesService, DocentesRepository],
  exports: [DocentesRepository],
})
export class DocentesModule {}
