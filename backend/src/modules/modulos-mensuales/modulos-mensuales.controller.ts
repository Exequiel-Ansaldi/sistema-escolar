import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ModulosMensualesService } from './modulos-mensuales.service';
import { CrearModuloMensualDto } from './dto/crear-modulo-mensual.dto';
import { ActualizarModuloMensualDto } from './dto/actualizar-modulo-mensual.dto';
import { FiltrarModulosMensualesDto } from './dto/filtrar-modulos-mensuales.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('modulos-mensuales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.PRECEPTOR_MANANA)
export class ModulosMensualesController {
  constructor(private service: ModulosMensualesService) {}

  @Get()
  findByMes(@Query() query: FiltrarModulosMensualesDto) {
    return this.service.findByMes(
      query.mes,
      query.page ?? 1,
      query.limit ?? 10,
      {
        anio: query.anio,
        division: query.division,
        turno: query.turno,
        materiaId: query.materiaId,
      },
    );
  }

  @Post()
  upsert(@Body() dto: CrearModuloMensualDto) {
    return this.service.upsert(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarModuloMensualDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
