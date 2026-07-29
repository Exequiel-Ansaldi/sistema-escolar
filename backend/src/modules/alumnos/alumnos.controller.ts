import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { CrearAlumnoDto } from './dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from './dto/actualizar-alumno.dto';

@Controller('alumnos')
export class AlumnosController {
  constructor(private alumnosService: AlumnosService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.alumnosService.findAll(p, l, search || undefined);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findById(id);
  }

  @Post()
  create(@Body() dto: CrearAlumnoDto) {
    return this.alumnosService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarAlumnoDto) {
    return this.alumnosService.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.disable(id);
  }
}