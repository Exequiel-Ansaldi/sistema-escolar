import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.VICERRECTOR)
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
    return this.dashboardService.ultimasAsistencias(
      limite ? Number(limite) : 10,
    );
  }

  @Get('calificaciones-resumen')
  calificacionesResumen() {
    return this.dashboardService.calificacionesResumen();
  }
}
