import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DiasSinClasesController } from './dias-sin-clases.controller';
import { DiasSinClasesService } from './dias-sin-clases.service';
import { DiasSinClasesRepository } from './repositories/dias-sin-clases.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DiasSinClasesController],
  providers: [DiasSinClasesService, DiasSinClasesRepository],
  exports: [DiasSinClasesService, DiasSinClasesRepository],
})
export class DiasSinClasesModule {}
