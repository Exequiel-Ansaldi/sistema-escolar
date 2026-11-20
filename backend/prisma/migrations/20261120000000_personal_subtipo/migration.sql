-- Fase C: las cuentas dejan de ser tabla de usuarios y pasan a ser el subtipo
-- "personal" de personas (persona = humano, subtipos = roles de vida).

-- CreateTable
CREATE TABLE "personal" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_persona_id_key" ON "personal"("persona_id");
CREATE UNIQUE INDEX "personal_nombre_usuario_key" ON "personal"("nombre_usuario");

-- Migrar cuentas existentes (el estado de cuenta al momento de migrar era persona.estado)
INSERT INTO "personal" ("persona_id", "nombre_usuario", "contraseña", "rol_id", "activo", "created_at", "updated_at")
SELECT u."persona_id", u."nombre_usuario", u."contraseña", u."rol_id",
       (CASE WHEN p."estado" = 'activo' THEN true ELSE false END),
       u."created_at", u."updated_at"
FROM "usuarios" u
JOIN "personas" p ON p."id" = u."persona_id";

-- DropTable
DROP TABLE "usuarios";

-- AddForeignKey
ALTER TABLE "personal" ADD CONSTRAINT "personal_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "personal" ADD CONSTRAINT "personal_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
