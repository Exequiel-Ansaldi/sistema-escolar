import { Module } from '@nestjs/common';
import { ModulosSemanaController } from './modulos-semana.controller';
import { ModulosSemanaService } from './modulos-semana.service';
import { ModulosSemanaRepository } from './repositories/modulos-semana.repository';

@Module({
  controllers: [ModulosSemanaController],
  providers: [ModulosSemanaService, ModulosSemanaRepository],
})
export class ModulosSemanaModule {}
