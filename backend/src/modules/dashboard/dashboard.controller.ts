import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
// Regla 2026-11-20: el dashboard es visible SOLO para rector (admin siempre
// pasa por el guard). Antes también entraba vicerrector.
@Roles(ROLES.RECTOR)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('resumen')
  resumen() {
    return this.dashboardService.resumen();
  }

  @Get('aprobados-por-curso')
  aprobadosPorCurso() {
    return this.dashboardService.aprobadosPorCurso();
  }

  @Get('ultimas-asistencias')
  ultimasAsistencias(@Query('limite') limite?: string) {
    return this.dashboardService.ultimasAsistencias(
      limite ? Number(limite) : 10,
    );
  }

  @Get('promedio-por-anio')
  promedioPorAnio() {
    return this.dashboardService.promedioPorAnio();
  }
}
