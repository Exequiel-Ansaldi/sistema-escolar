import { Controller, Get, Post, Patch, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { ModulosSemanaService } from './modulos-semana.service';
import { CrearModuloSemanaDto } from './dto/crear-modulo-semana.dto';
import { ActualizarModuloSemanaDto } from './dto/actualizar-modulo-semana.dto';

@Controller('modulos-semana')
export class ModulosSemanaController {
  constructor(private service: ModulosSemanaService) {}

  @Get()
  findByMes(@Query('mes') mes: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.findByMes(mes, +page, +limit);
  }

  @Post()
  upsert(@Body() dto: CrearModuloSemanaDto) {
    return this.service.upsert(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarModuloSemanaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
