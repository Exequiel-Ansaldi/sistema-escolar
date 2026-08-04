import { PartialType } from '@nestjs/mapped-types';
import { CrearCalificacionDto } from './crear-calificacion.dto';

export class ActualizarCalificacionDto extends PartialType(
  CrearCalificacionDto,
) {}
