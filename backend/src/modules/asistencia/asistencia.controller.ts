import { Controller, Get, Post, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';

@Controller('asistencias')
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
  buscarPorAlumno(
    @Query('q') q: string,
    @Query('fecha') fecha: string,
  ) {
    return this.asistenciaService.buscarPorAlumno(q, fecha);
  }

  @Post()
  registrar(@Body() dto: CrearAsistenciaDto) {
    return this.asistenciaService.registrar(dto);
  }

  @Post('masivo')
  registrarMasivo(@Body() datos: CrearAsistenciaDto[]) {
    return this.asistenciaService.registrarMasivo(datos);
  }
}