# Generalización: personas como supertipo de usuarios/alumnos/docentes/tutores

Objetivo: extraer los atributos comunes de identidad (dni, nombre, apellido, telefono, estado) a una tabla `personas`; cada subtipo conserva sus atributos distintivos y referencia a `personas` por FK. El contrato de la API se mantiene plano (los repositories mapean), el frontend no cambia.

Branch: `main` (local) · Test runner: `npm run build` (tsc) + arranque real + smoke HTTP · Runner de e2e: script `e2e-rbac.ps1` (manual, con backend arriba)

## Specs

S1 (petición del usuario, verbatim): "necesito que usuarios, alumnos, docentes, tutores, sea una generalizacion es decir que todos los usuarios tengan en comun lo que tienen alumnos,docentes y tutores, y que cada uno tenga en su tabla sus propis atributos distintivos".
  - Decisión posterior del usuario (corrección): "espera no quise responder eso, hereda de persona si" → `usuarios` SÍ hereda de `personas`, con `dni` opcional en esa rama.

S2: `personas` (supertipo) contiene: `dni` (String?, unique — nullable porque usuarios no lo tienen), `nombre`, `apellido`, `telefono` (String?), `estado` (String, default 'activo'; reemplaza `usuario.activo` y unifica con `alumno.estado`/`docente.estado`).

S3: Subtipos con FK `persona_id` a `personas`:
  - `alumnos`: `nacimiento`, `direccion`, `fecha_ingreso`, `fecha_egreso` (+ FKs salientes existentes sin cambio).
  - `docentes`: `email` (unique), `fecha_ingreso`.
  - `tutores`: `alumno_id` (tutor de ese alumno). N:M persona→tutor permitido (un tutor puede figurar para varios alumnos; dni duplicado entre tutores es el mismo caso hoy).
  - `usuarios`: `nombre_usuario` (unique), `contraseña`, `rol_id`. `activo` se elimina; el check de login pasa a `persona.estado === 'activo'`.

S4: Los FKs existentes hacia subtipos (`inscripciones.alumno_id`, `asistencias.alumno_id`, `calificaciones.alumno_id`, `actas/acuerdos/seguimientos/tutores.alumno_id`, `docentes_materias.docente_id`, `licencias.docente_id`, `modulos_mensuales.docente_id`) NO cambian.

S5: Contrato de API plano: las respuestas de alumno/docente/tutor/usuario siguen exponiendo `nombre`, `apellido`, `dni`, `telefono`, `estado` al mismo nivel (mapeo en repositories). El frontend no modifica tipos ni páginas.

S6: Migración con backfill preservando TODOS los datos existentes (backup pg_dump previo obligatorio). Orden de dependencias respetado (lección del fix af18164).

S7: Acceptance: (a) `prisma migrate deploy` en base nueva aplica todas las migraciones; (b) backend arranca; (c) `POST /api/auth/login` 200 con `admin/admin123` y rechaza usuario `estado !== 'activo'`; (d) `GET /api/alumnos` con token devuelve el shape plano con datos correctos; (e) build frontend sin cambios.

## Tasks

- T1 (S1,S2,S3): schema.prisma — modelo `Persona` + refactor de Usuario/Alumno/Docente/Tutor. Route: inline. ✅ hecha.
- T2 (S6): migración SQL manual con backfill + backup pg_dump previo + `prisma migrate deploy` local. Route: inline. ✅ hecha (corrección: faltaban DROP nombre/apellido de usuarios; añadidos).
- T3 (S5,S7): repositories/services de módulos afectados mapeando a shape plano (alumnos, docentes, tutores, usuarios, auth+jwt.strategy, asistencia, cursos, inscripcion, materias, dashboard, modulos-mensuales, reportes). Route: inline. ✅ hecha (creaciones/updates/devoluciones serializadas planas).
- T4 (S6): `prisma/seed.ts` actualizado (personas primero, dos fases createMany, dedupe dnis de tutores). Route: inline. ✅ hecha.
- T5 (S7): verificación: tsc 0 errores; seed OK; deploy scratch OK (todas las migraciones desde cero); smoke login/alumnos GET-POST-PUT-DELETE/docentes/usuarios/dashboard/asistencias OK; build frontend OK sin cambios. Commits: T1..T5 en un solo commit (unidad coherente, supera 400 líneas porque schema+migración+13 repos+seed son un solo comportamiento). ✅ hecha.

## Log

- L1 (verbatim): "bueno escucha primera cosa a corregir, necesito que usuarios, alumnos, docentes, tutores, sea una generalizacion es decir que todos los usuarios tengan en comun lo que tienen alumnos,docentes y tutores, y que cada uno tenga en su tabla sus propis atributos distintivos se entiende? que te parece?"
- L2: Pregunta de diseño respondida con opción "No, usuarios queda separado" y corregida por el usuario: "espera no quise responder eso, hereda de persona si" → usuarios hereda de personas, dni opcional.
- L3: Alcance relevado: 7 repos tocan `prisma.alumno|docente|tutor|usuario` directamente (alumnos, auth, dashboard, docentes, reportes, tutores, usuarios); ~8 repos más anidan `include: { alumno/docente }` (asistencia, cursos, inscripcion, materias, calificaciones, curso-materia, modulos-mensuales, dias-sin-clases). Servicios no tocan Prisma directo.
- L4: Riesgo: ítem 1 (migración de datos existentes) y ítem 3 (contrato consumido por frontend) → backup obligatorio, shape plano para no romper el frontend, verificación con deploy scratch.
- L5: Implementación y verificación: migración `20261119040000_generalizacion_personas` aplicada (987 personas, backfill verificado); bug encontrado durante verificación — el SQL olvidaba DROP nombre/apellido de usuarios (P2011 en seed), corregido en el mismo archivo. Un proceso viejo `node dist/src/main` retenía :3000 con un build antiguo (causó un 500 engañoso en el primer smoke; era un proceso zombi, no código nuevo). Verificación final: tsc 0 errores, seed OK, migrate deploy desde cero OK, smoke HTTP completo OK (login 200, alumnos CRUD plano, dashboard 337/60/7), frontend build OK sin cambios de código.
