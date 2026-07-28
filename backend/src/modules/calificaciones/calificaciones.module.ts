import { Module } from '@nestjs/common';
import { CalificacionesController } from './calificaciones.controller';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesRepository } from './repositories/calificaciones.repository';
import { AlumnosModule } from '../alumnos/alumnos.module';
import { MateriasModule } from '../materias/materias.module';

@Module({
  imports: [AlumnosModule, MateriasModule],
  controllers: [CalificacionesController],
  providers: [CalificacionesService, CalificacionesRepository],
})
export class CalificacionesModule {}