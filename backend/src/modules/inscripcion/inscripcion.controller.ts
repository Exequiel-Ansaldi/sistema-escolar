import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';

@Controller('inscripciones')
export class InscripcionController {
  constructor(private inscripcionService: InscripcionService) {}

  @Get()
  listar(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.inscripcionService.findAll(+page, +limit);
  }

  @Post()
  inscribir(@Body() dto: CrearInscripcionDto) {
    return this.inscripcionService.inscribir(dto);
  }

  @Delete(':alumnoId/:cursoId')
  desinscribir(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('cursoId', ParseIntPipe) cursoId: number,
  ) {
    return this.inscripcionService.desinscribir(alumnoId, cursoId);
  }
}