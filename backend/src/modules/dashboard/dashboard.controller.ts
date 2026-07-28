import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('resumen')
  resumen() {
    return this.dashboardService.resumen();
  }

  @Get('alumnos-por-curso')
  alumnosPorCurso() {
    return this.dashboardService.alumnosPorCurso();
  }

  @Get('ultimas-asistencias')
  ultimasAsistencias(@Query('limite') limite?: string) {
    return this.dashboardService.ultimasAsistencias(limite ? Number(limite) : 10);
  }

  @Get('calificaciones-resumen')
  calificacionesResumen() {
    return this.dashboardService.calificacionesResumen();
  }
}