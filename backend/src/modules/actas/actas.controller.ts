import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ActasService } from './actas.service';

@Controller('actas')
export class ActasController {
  constructor(private service: ActasService) {}
  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) id: number) { return this.service.findByAlumno(id); }
  @Post()
  create(@Body() body: any) { return this.service.create(body); }
}
