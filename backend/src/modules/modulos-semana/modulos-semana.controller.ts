import { Controller, Get, Post, Patch, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { ModulosSemanaService } from './modulos-semana.service';

@Controller('modulos-semana')
export class ModulosSemanaController {
  constructor(private service: ModulosSemanaService) {}

  @Get()
  findByMes(@Query('mes') mes: string) {
    return this.service.findByMes(mes);
  }

  @Post()
  upsert(@Body() body: any) {
    return this.service.upsert(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
