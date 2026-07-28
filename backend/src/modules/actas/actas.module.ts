import { Module } from '@nestjs/common';
import { ActasController } from './actas.controller';
import { AcuerdosController } from './acuerdos.controller';
import { SeguimientoController } from './seguimiento.controller';
import { TutoresController } from './tutores.controller';
import { ActasService, AcuerdosService, SeguimientoService, TutoresService } from './actas.service';
import { ActasRepository, AcuerdosRepository, SeguimientoRepository, TutoresRepository } from './repositories/actas.repository';

@Module({
  controllers: [ActasController, AcuerdosController, SeguimientoController, TutoresController],
  providers: [ActasService, AcuerdosService, SeguimientoService, TutoresService, ActasRepository, AcuerdosRepository, SeguimientoRepository, TutoresRepository],
})
export class ActasModule {}
