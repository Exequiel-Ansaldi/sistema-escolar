import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { FiltrarInscripcionesDto } from './dto/filtrar-inscripciones.dto';

@Controller('inscripciones')
export class InscripcionController {
  constructor(private inscripcionService: InscripcionService) {}

  @Get()
  listar(@Query() query: FiltrarInscripcionesDto) {
    return this.inscripcionService.findAll(query.page ?? 1, query.limit ?? 10, {
      anio: query.anio,
      division: query.division,
      turno: query.turno,
    });
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
