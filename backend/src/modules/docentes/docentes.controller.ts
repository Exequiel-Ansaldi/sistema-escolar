import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';

@Controller('docentes')
export class DocentesController {
  constructor(private docentesService: DocentesService) {}

  @Get() findAll() { return this.docentesService.findAll(); }
  @Get(':id') findById(@Param('id', ParseIntPipe) id: number) { return this.docentesService.findById(id); }
  @Post() create(@Body() dto: CrearDocenteDto) { return this.docentesService.create(dto); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarDocenteDto) {
    return this.docentesService.update(id, dto);
  }
  @Delete(':id') disable(@Param('id', ParseIntPipe) id: number) { return this.docentesService.disable(id); }
}