/*
  Warnings:

  - You are about to drop the column `carga_horaria` on the `materias` table. All the data in the column will be lost.
  - You are about to drop the `horarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_docente_id_fkey";

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_materia_id_fkey";

-- AlterTable
ALTER TABLE "acuerdos" ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'alumno';

-- AlterTable
ALTER TABLE "asistencias" ALTER COLUMN "estado" SET DEFAULT 'ausente';

-- AlterTable
ALTER TABLE "licencias" ADD COLUMN     "codigo" TEXT NOT NULL DEFAULT 'LIC-OTRO';

-- AlterTable
ALTER TABLE "materias" DROP COLUMN "carga_horaria";

-- DropTable
DROP TABLE "horarios";

-- CreateTable
CREATE TABLE "cursos_materias" (
    "curso_id" INTEGER NOT NULL,
    "materia_id" INTEGER NOT NULL,
    "carga_horaria" INTEGER NOT NULL,
    "modulos_por_semana" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cursos_materias_pkey" PRIMARY KEY ("curso_id","materia_id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" SERIAL NOT NULL,
    "docente_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "materia_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulos_previstos" INTEGER NOT NULL,
    "modulos_dictados" INTEGER NOT NULL,
    "factor" TEXT,
    "observacion" TEXT,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cursos_materias" ADD CONSTRAINT "cursos_materias_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_materias" ADD CONSTRAINT "cursos_materias_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_curso_id_materia_id_fkey" FOREIGN KEY ("curso_id", "materia_id") REFERENCES "cursos_materias"("curso_id", "materia_id") ON DELETE RESTRICT ON UPDATE CASCADE;
