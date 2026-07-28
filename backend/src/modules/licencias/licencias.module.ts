import { Module } from '@nestjs/common';
import { LicenciasController } from './licencias.controller';
import { LicenciasService } from './licencias.service';
import { LicenciasRepository } from './repositories/licencias.repository';

@Module({
  controllers: [LicenciasController],
  providers: [LicenciasService, LicenciasRepository],
})
export class LicenciasModule {}
