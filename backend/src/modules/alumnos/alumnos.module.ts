import { Module } from '@nestjs/common';
import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';
import { AlumnosRepository } from './repositories/alumnos.repository';

@Module({
  controllers: [AlumnosController],
  providers: [AlumnosService, AlumnosRepository],
  exports: [AlumnosService, AlumnosRepository],
})
export class AlumnosModule {}