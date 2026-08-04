import { PartialType } from '@nestjs/mapped-types';
import { CrearMateriaDto } from './crear-materia.dto';

export class ActualizarMateriaDto extends PartialType(CrearMateriaDto) {}
