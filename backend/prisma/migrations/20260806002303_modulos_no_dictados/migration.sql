-- AlterTable
ALTER TABLE "modulos_mensuales" DROP COLUMN "factor";

-- CreateTable
CREATE TABLE "modulos_no_dictados" (
    "id" SERIAL NOT NULL,
    "modulo_mensual_id" INTEGER NOT NULL,
    "factor" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "modulos_no_dictados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_no_dictados_modulo_mensual_id_factor_key" ON "modulos_no_dictados"("modulo_mensual_id", "factor");

-- AddForeignKey
ALTER TABLE "modulos_no_dictados" ADD CONSTRAINT "modulos_no_dictados_modulo_mensual_id_fkey" FOREIGN KEY ("modulo_mensual_id") REFERENCES "modulos_mensuales"("id") ON DELETE CASCADE ON UPDATE CASCADE;