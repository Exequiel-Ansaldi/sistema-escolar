import { PartialType } from '@nestjs/mapped-types';
import { CrearAlumnoDto } from './crear-alumno.dto';

export class ActualizarAlumnoDto extends PartialType(CrearAlumnoDto) {}