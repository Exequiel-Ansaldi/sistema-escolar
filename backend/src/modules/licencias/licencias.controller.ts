import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { LicenciasService } from './licencias.service';

@Controller('licencias')
export class LicenciasController {
  constructor(private licenciasService: LicenciasService) {}

  @Get('docente/:docenteId')
  findByDocente(@Param('docenteId', ParseIntPipe) id: number) {
    return this.licenciasService.findByDocente(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.licenciasService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.licenciasService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasService.delete(id);
  }
}
