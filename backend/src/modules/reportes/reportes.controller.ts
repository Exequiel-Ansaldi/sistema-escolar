import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { FiltrarReporteAsistenciaDto } from './dto/filtrar-reporte-asistencia.dto';

@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Get('calificaciones/:alumnoId')
  async reporteCalificaciones(
    @Res() res: Response,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ) {
    const pdf = await this.reportesService.reporteCalificaciones(alumnoId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=calificaciones_${alumnoId}.pdf`,
    });
    res.send(pdf);
  }

  @Get('asistencia/:alumnoId')
  async reporteAsistencia(
    @Res() res: Response,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query() query: FiltrarReporteAsistenciaDto,
  ) {
    const pdf = await this.reportesService.reporteAsistencia(
      alumnoId,
      query.desde,
      query.hasta,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=asistencia_${alumnoId}.pdf`,
    });
    res.send(pdf);
  }

  @Get('curso/:cursoId')
  async reporteCurso(
    @Res() res: Response,
    @Param('cursoId', ParseIntPipe) cursoId: number,
  ) {
    const pdf = await this.reportesService.reporteCurso(cursoId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=curso_${cursoId}.pdf`,
    });
    res.send(pdf);
  }
}
