import { PartialType } from '@nestjs/mapped-types';
import { CrearAsistenciaDto } from './crear-asistencia.dto';

export class ActualizarAsistenciaDto extends PartialType(CrearAsistenciaDto) {}
