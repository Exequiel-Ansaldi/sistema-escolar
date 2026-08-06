import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { FiltrarInscripcionesDto } from './dto/filtrar-inscripciones.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('inscripciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.SECRETARIA_ALUMNADO)
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
