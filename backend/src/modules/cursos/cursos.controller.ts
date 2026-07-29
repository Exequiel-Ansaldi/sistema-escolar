import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';

@Controller('cursos')
export class CursosController {
  constructor(private cursosService: CursosService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('anio') anio?: string,
    @Query('division') division?: string,
    @Query('turno') turno?: string,
  ) {
    const filters: any = {};
    if (anio) filters.anio = parseInt(anio, 10);
    if (division) filters.division = division;
    if (turno) filters.turno = turno;
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.cursosService.findAll(p, l, filters);
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
