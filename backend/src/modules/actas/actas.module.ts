import { Module } from '@nestjs/common';
import { ActasController } from './actas.controller';
import { ActasService } from './actas.service';
import { ActasRepository } from './repositories/actas.repository';

@Module({
  controllers: [ActasController],
  providers: [ActasService, ActasRepository],
  exports: [ActasService],
})
export class ActasModule {}
