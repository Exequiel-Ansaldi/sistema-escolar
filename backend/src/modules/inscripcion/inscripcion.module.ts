import { Module } from '@nestjs/common';
import { InscripcionController } from './inscripcion.controller';
import { InscripcionService } from './inscripcion.service';
import { InscripcionRepository } from './repositories/inscripcion.repository';
import { AlumnosModule } from '../alumnos/alumnos.module';
import { CursosModule } from '../cursos/cursos.module';

@Module({
  imports: [AlumnosModule, CursosModule],
  controllers: [InscripcionController],
  providers: [InscripcionService, InscripcionRepository],
})
export class InscripcionModule {}