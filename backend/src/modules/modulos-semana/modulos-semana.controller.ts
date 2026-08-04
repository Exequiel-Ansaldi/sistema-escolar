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
} from '@nestjs/common';
import { ModulosSemanaService } from './modulos-semana.service';
import { CrearModuloSemanaDto } from './dto/crear-modulo-semana.dto';
import { ActualizarModuloSemanaDto } from './dto/actualizar-modulo-semana.dto';
import { FiltrarModulosDto } from './dto/filtrar-modulos.dto';

@Controller('modulos-semana')
export class ModulosSemanaController {
  constructor(private service: ModulosSemanaService) {}

  @Get()
  findByMes(@Query() query: FiltrarModulosDto) {
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
  upsert(@Body() dto: CrearModuloSemanaDto) {
    return this.service.upsert(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarModuloSemanaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
