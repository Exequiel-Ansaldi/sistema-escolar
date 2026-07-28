import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { SeguimientoService } from './actas.service';

@Controller('seguimientos')
export class SeguimientoController {
  constructor(private service: SeguimientoService) {}
  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) id: number) { return this.service.findByAlumno(id); }
  @Post()
  create(@Body() body: any) { return this.service.create(body); }
}
