import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TutoresService } from './tutores.service';
import { CrearTutorDto } from './dto/crear-tutor.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('tutores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.ASESORIA_PEDAGOGICA)
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
