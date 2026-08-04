import { Module } from '@nestjs/common';
import { TutoresController } from './tutores.controller';
import { TutoresService } from './tutores.service';
import { TutoresRepository } from './repositories/tutores.repository';

@Module({
  controllers: [TutoresController],
  providers: [TutoresService, TutoresRepository],
  exports: [TutoresService],
})
export class TutoresModule {}
