import { Module } from '@nestjs/common';
import { AcuerdosController } from './acuerdos.controller';
import { AcuerdosService } from './acuerdos.service';
import { AcuerdosRepository } from './repositories/acuerdos.repository';

@Module({
  controllers: [AcuerdosController],
  providers: [AcuerdosService, AcuerdosRepository],
  exports: [AcuerdosService],
})
export class AcuerdosModule {}
