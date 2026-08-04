import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TutoresService } from './tutores.service';
import { CrearTutorDto } from './dto/crear-tutor.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';

@Controller('tutores')
export class TutoresController {
  constructor(private service: TutoresService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe) id: number,
    @Query() query: PaginacionQueryDto,
  ) {
    return this.service.findByAlumno(id, query.page ?? 1, query.limit ?? 10);
  }

  @Post()
  create(@Body() dto: CrearTutorDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
