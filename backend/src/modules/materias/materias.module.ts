import { Module } from '@nestjs/common';
import { MateriasController } from './materias.controller';
import { MateriasService } from './materias.service';
import { MateriasRepository } from './repositories/materias.repository';

@Module({
  controllers: [MateriasController],
  providers: [MateriasService, MateriasRepository],
  exports: [MateriasRepository],
})
export class MateriasModule {}
