import { Module } from '@nestjs/common';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaRepository } from './repositories/asistencia.repository';
import { AlumnosModule } from '../alumnos/alumnos.module';
import { DiasSinClasesModule } from '../dias-sin-clases/dias-sin-clases.module';

@Module({
  imports: [AlumnosModule, DiasSinClasesModule],
  controllers: [AsistenciaController],
  providers: [AsistenciaService, AsistenciaRepository],
})
export class AsistenciaModule {}
