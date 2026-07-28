import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TutoresService } from './actas.service';

@Controller('tutores')
export class TutoresController {
  constructor(private service: TutoresService) {}
  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) id: number) { return this.service.findByAlumno(id); }
  @Post()
  create(@Body() body: any) { return this.service.create(body); }
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
