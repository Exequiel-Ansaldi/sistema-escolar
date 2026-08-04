import { PartialType } from '@nestjs/mapped-types';
import { CrearModuloSemanaDto } from './crear-modulo-semana.dto';

export class ActualizarModuloSemanaDto extends PartialType(
  CrearModuloSemanaDto,
) {}
