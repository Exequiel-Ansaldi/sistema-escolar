import { Controller, Get, Post, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AcuerdosService } from './actas.service';

@Controller('acuerdos')
export class AcuerdosController {
  constructor(private service: AcuerdosService) {}
  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) id: number) { return this.service.findByAlumno(id); }
  @Post()
  create(@Body() body: any) { return this.service.create(body); }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }
}
