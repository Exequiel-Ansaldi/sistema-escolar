/*
  Warnings:

  - You are about to drop the `modulos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "modulos" DROP CONSTRAINT "modulos_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "modulos" DROP CONSTRAINT "modulos_curso_id_materia_id_fkey";

-- DropForeignKey
ALTER TABLE "modulos" DROP CONSTRAINT "modulos_docente_id_fkey";

-- DropForeignKey
ALTER TABLE "modulos" DROP CONSTRAINT "modulos_materia_id_fkey";

-- DropTable
DROP TABLE "modulos";

-- CreateTable
CREATE TABLE "modulos_mensuales" (
    "id" SERIAL NOT NULL,
    "docente_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "materia_id" INTEGER NOT NULL,
    "mes" TIMESTAMP(3) NOT NULL,
    "modulos_previstos" INTEGER NOT NULL,
    "modulos_dictados" INTEGER NOT NULL,
    "factor" TEXT,
    "observacion" TEXT,

    CONSTRAINT "modulos_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dias_sin_clases" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "curso_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dias_sin_clases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_mensuales_curso_id_materia_id_docente_id_mes_key" ON "modulos_mensuales"("curso_id", "materia_id", "docente_id", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "dias_sin_clases_fecha_tipo_curso_id_key" ON "dias_sin_clases"("fecha", "tipo", "curso_id");

-- AddForeignKey
ALTER TABLE "modulos_mensuales" ADD CONSTRAINT "modulos_mensuales_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos_mensuales" ADD CONSTRAINT "modulos_mensuales_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos_mensuales" ADD CONSTRAINT "modulos_mensuales_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dias_sin_clases" ADD CONSTRAINT "dias_sin_clases_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
