-- Generalización: personas como supertipo de usuarios/alumnos/docentes/tutores
-- Backfill preservando datos: alumnos/docentes/tutores/usuarios -> personas

-- CreateTable
CREATE TABLE "personas" (
    "id" SERIAL NOT NULL,
    "dni" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- ── Backfill alumnos (dni secuencial único) ──
ALTER TABLE "alumnos" ADD COLUMN "persona_id" INTEGER;
INSERT INTO "personas" ("dni", "nombre", "apellido", "telefono", "estado")
SELECT "dni", "nombre", "apellido", "telefono", "estado" FROM "alumnos";
UPDATE "alumnos" a SET "persona_id" = p."id" FROM "personas" p WHERE p."dni" = a."dni";
ALTER TABLE "alumnos" ALTER COLUMN "persona_id" SET NOT NULL;

-- ── Backfill docentes (dni secuencial único) ──
ALTER TABLE "docentes" ADD COLUMN "persona_id" INTEGER;
INSERT INTO "personas" ("dni", "nombre", "apellido", "telefono", "estado")
SELECT "dni", "nombre", "apellido", "telefono", "estado" FROM "docentes";
UPDATE "docentes" d SET "persona_id" = p."id" FROM "personas" p WHERE p."dni" = d."dni";
ALTER TABLE "docentes" ALTER COLUMN "persona_id" SET NOT NULL;

-- ── Backfill tutores (dni aleatorio: puede repetirse entre tutores y chocar con docentes;
--    misma identidad = misma persona; se deduplica por dni) ──
ALTER TABLE "tutores" ADD COLUMN "persona_id" INTEGER;
INSERT INTO "personas" ("dni", "nombre", "apellido", "telefono", "estado")
SELECT "dni", "nombre", "apellido", NULL, 'activo' FROM "tutores"
ON CONFLICT ("dni") DO NOTHING;
UPDATE "tutores" t SET "persona_id" = p."id" FROM "personas" p WHERE p."dni" = t."dni";
ALTER TABLE "tutores" ALTER COLUMN "persona_id" SET NOT NULL;

-- ── Backfill usuarios (sin dni; identidad por nombre+apellido) ──
ALTER TABLE "usuarios" ADD COLUMN "persona_id" INTEGER;
INSERT INTO "personas" ("nombre", "apellido", "estado")
SELECT "nombre", "apellido", CASE WHEN "activo" THEN 'activo' ELSE 'inactivo' END FROM "usuarios";
UPDATE "usuarios" u SET "persona_id" = p."id" FROM "personas" p
WHERE p."nombre" = u."nombre" AND p."apellido" = u."apellido" AND p."dni" IS NULL;
ALTER TABLE "usuarios" ALTER COLUMN "persona_id" SET NOT NULL;

-- ── Limpiar columnas movidas al supertipo ──
ALTER TABLE "alumnos" DROP COLUMN "dni",
    DROP COLUMN "nombre",
    DROP COLUMN "apellido",
    DROP COLUMN "telefono",
    DROP COLUMN "estado";

ALTER TABLE "docentes" DROP COLUMN "dni",
    DROP COLUMN "nombre",
    DROP COLUMN "apellido",
    DROP COLUMN "telefono",
    DROP COLUMN "estado";

ALTER TABLE "tutores" DROP COLUMN "dni",
    DROP COLUMN "nombre",
    DROP COLUMN "apellido";

ALTER TABLE "usuarios" DROP COLUMN "nombre",
    DROP COLUMN "apellido",
    DROP COLUMN "activo";

-- ── FKs subtipo -> supertipo ──
ALTER TABLE "alumnos" ADD CONSTRAINT "alumnos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "docentes" ADD CONSTRAINT "docentes_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tutores" ADD CONSTRAINT "tutores_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
