import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { MateriasService } from './materias.service';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';

@Controller('materias')
export class MateriasController {
  constructor(private materiasService: MateriasService) {}

  @Get() findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.materiasService.findAll(+(page ?? 1), +(limit ?? 10), search || undefined);
  }
  @Get(':id') findById(@Param('id', ParseIntPipe) id: number) { return this.materiasService.findById(id); }
  @Post() create(@Body() dto: CrearMateriaDto) { return this.materiasService.create(dto); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarMateriaDto) {
    return this.materiasService.update(id, dto);
  }
  @Delete(':id') delete(@Param('id', ParseIntPipe) id: number) { return this.materiasService.delete(id); }
}