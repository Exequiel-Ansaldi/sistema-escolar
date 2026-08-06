import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';
import { RegistrarAsistenciasMasivoDto } from './dto/registrar-asistencias-masivo.dto';
import { FiltrarAsistenciasBuscarDto } from './dto/filtrar-asistencias-buscar.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.PRECEPTOR_MANANA)
export class AsistenciaController {
  constructor(private asistenciaService: AsistenciaService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.asistenciaService.findByAlumno(alumnoId);
  }

  @Get('curso/:cursoId')
  findByCursoYFecha(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Query('fecha') fecha: string,
  ) {
    return this.asistenciaService.findByCursoYFecha(cursoId, fecha);
  }

  @Get('buscar')
  buscarPorAlumno(@Query() query: FiltrarAsistenciasBuscarDto) {
    return this.asistenciaService.buscarPorAlumno(
      query.q,
      query.fecha,
      query.page ?? 1,
      query.limit ?? 10,
      {
        anio: query.anio,
        division: query.division,
        turno: query.turno,
      },
    );
  }

  @Post()
  registrar(@Body() dto: CrearAsistenciaDto) {
    return this.asistenciaService.registrar(dto);
  }

  @Post('masivo')
  registrarMasivo(@Body() dto: RegistrarAsistenciasMasivoDto) {
    return this.asistenciaService.registrarMasivo(dto.datos);
  }
}
