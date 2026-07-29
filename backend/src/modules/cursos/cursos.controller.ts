import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';

@Controller('cursos')
export class CursosController {
  constructor(private cursosService: CursosService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cursosService.findAll(+(page ?? 1), +(limit ?? 10));
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) { return this.cursosService.findById(id); }

  @Post()
  create(@Body() dto: CrearCursoDto) { return this.cursosService.create(dto); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarCursoDto) {
    return this.cursosService.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id', ParseIntPipe) id: number) { return this.cursosService.disable(id); }
}