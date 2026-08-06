import { Module } from '@nestjs/common';
import { ModulosMensualesController } from './modulos-mensuales.controller';
import { ModulosMensualesService } from './modulos-mensuales.service';
import { ModulosMensualesRepository } from './repositories/modulos-mensuales.repository';

@Module({
  controllers: [ModulosMensualesController],
  providers: [ModulosMensualesService, ModulosMensualesRepository],
})
export class ModulosMensualesModule {}
