import { Controller, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';

@Controller('inscripciones')
export class InscripcionController {
  constructor(private inscripcionService: InscripcionService) {}

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