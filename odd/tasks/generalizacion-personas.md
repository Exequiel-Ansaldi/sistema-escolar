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
  - (MODIFICADO por S8: la rama `usuarios` deja de ser subtipo y pasa a `personal`.)

S4: Los FKs existentes hacia subtipos (`inscripciones.alumno_id`, `asistencias.alumno_id`, `calificaciones.alumno_id`, `actas/acuerdos/seguimientos/tutores.alumno_id`, `docentes_materias.docente_id`, `licencias.docente_id`, `modulos_mensuales.docente_id`) NO cambian.

S5: Contrato de API plano: las respuestas de alumno/docente/tutor/usuario siguen exponiendo `nombre`, `apellido`, `dni`, `telefono`, `estado` al mismo nivel (mapeo en repositories). El frontend no modifica tipos ni páginas.

S6: Migración con backfill preservando TODOS los datos existentes (backup pg_dump previo obligatorio). Orden de dependencias respetado (lección del fix af18164).

S7: Acceptance: (a) `prisma migrate deploy` en base nueva aplica todas las migraciones; (b) backend arranca; (c) `POST /api/auth/login` 200 con `admin/admin123` y rechaza usuario `estado !== 'activo'`; (d) `GET /api/alumnos` con token devuelve el shape plano con datos correctos; (e) build frontend sin cambios.

S8 (decisión del usuario 2026-11-20): rediseño de cuentas — modelo "persona = humano, subtipos = roles de vida". La tabla `usuarios` se reemplaza por `personal` (subtipo de `personas`): `persona_id` (unique, 1:1), `nombre_usuario` (unique), `contraseña`, `rol_id`, `activo` (Boolean, default true — vuelve a ser estado de la CUENTA, separado de `persona.estado`). El login de un docente futuro = misma persona con fila en `docentes` y en `personal` (dos subtipos, cero duplicación). Petición verbatim: "y si borro usuario y que quede la herencia de persona, pero que cada usuario del sistema que interactue como persona tenga sus atributos propios?".

S9: Auth en C: login busca `personal` por `nombre_usuario`, chequea `personal.activo` (persona.estado ya no bloquea cuentas), JWT `{ id: personal.id, rol }`; `RolesGuard` sin cambios. `LoginResponse.usuario` conserva shape `{ id, nombreUsuario, nombre, apellido, rol }` con nombre/apellido de `persona`.

S10: Endpoint `/api/usuarios` se conserva igual (path, verbos, shapes) pero gestiona cuentas de `personal`; `UsuarioResponse` plano `{ id, nombreUsuario, nombre, apellido, activo, rolId, rol }` con nombre/apellido desde `persona`. `Admin Sistema` queda como cuenta técnica (su persona con dni NULL; decisión de dato, no de diseño).

S11: Acceptance C: (a) `migrate deploy` desde cero aplica la migración de reversión+`personal`; (b) login 200 `admin/admin123`, 401 con pass malo, 401 con cuenta `activo=false`; (c) `GET /api/usuarios` con token devuelve shape plano y `activo` refleja `personal.activo`; (d) counts de dashboard OK; (e) build backend y frontend OK; (f) sin referencias residuales a `prisma.usuario`.

## Tasks

- T1 (S1,S2,S3): schema.prisma — modelo `Persona` + refactor de Usuario/Alumno/Docente/Tutor. Route: inline. ✅ hecha.
- T2 (S6): migración SQL manual con backfill + backup pg_dump previo + `prisma migrate deploy` local. Route: inline. ✅ hecha (corrección: faltaban DROP nombre/apellido de usuarios; añadidos).
- T3 (S5,S7): repositories/services de módulos afectados mapeando a shape plano (alumnos, docentes, tutores, usuarios, auth+jwt.strategy, asistencia, cursos, inscripcion, materias, dashboard, modulos-mensuales, reportes). Route: inline. ✅ hecha (creaciones/updates/devoluciones serializadas planas).
- T4 (S6): `prisma/seed.ts` actualizado (personas primero, dos fases createMany, dedupe dnis de tutores). Route: inline. ✅ hecha.
- L7: Blindaje del finding R3-mig-usuarios-001 (decisión del usuario): backfill de usuarios reescrito con emparejamiento 1:1 determinista por `nombre_usuario` UNIQUE mediante columna temporal `_usuario_nombre` en personas (dropeada al final de la misma migración). Verificado: prueba RED-style con dos homónimos (Ana Perez ×2) → 2 personas distintas, cada usuario a la suya; migrate deploy desde cero OK en scratch.
- L8 (2026-11-20): el usuario cuestiona el diseño ("no me cierra este diseño") y propone Opción C: eliminar la tabla `usuarios` y convertir las cuentas en subtipo `personal` de `personas` (persona = humano, subtipos = roles de vida). Decisión adoptada (ver S8-S11). La Opción A/B queda descartada; la implementación de la generalización de alumnos/docentes/tutores se conserva íntegra.

## Tasks (fase C)

- T5 (S7): verificación: tsc 0 errores; seed OK; deploy scratch OK (todas las migraciones desde cero); smoke login/alumnos GET-POST-PUT-DELETE/docentes/usuarios/dashboard/asistencias OK; build frontend OK sin cambios. Commits: T1..T5 en un solo commit (unidad coherente, supera 400 líneas porque schema+migración+13 repos+seed son un solo comportamiento). ✅ hecha.
- T6 (S8): schema.prisma — quitar `Usuario`, agregar `Personal` (subtipo 1:1 de personas con nombre_usuario/contraseña/rol_id/activo); `Rol.usuarios`→`Rol.personal`; `Persona.usuarios`→`Persona.personal`. Route: inline.
- T7 (S8,S11): migración `20261120000000_personal_subtipo`: CREATE personal (copia desde usuarios: persona_id, nombre_usuario, contraseña, rol_id, activo←persona.estado), DROP usuarios; backup previo no requerido (no destruye datos: solo renombra estructura; igualmente se conserva el dump del 19/11). Route: inline.
- T8 (S9,S10,S11): backend: auth.repository/service/jwt.strategy sobre `personal`; usuarios.repository/service sobre `personal` con shape plano `/api/usuarios`; dashboard.countUsuariosActivos por `activo: true`. Route: inline.
- T9 (S8,S11): seed: bloque roles+usuarios → crea persona (staff) + personal; limpieza agrega `personal.deleteMany()` y quita `usuario.deleteMany()`. Route: inline.
- T10 (S11): verificación: tsc 0 errores; grep sin `prisma.usuario` residual; scratch deploy desde cero; seed OK; smoke login 200/401 (pass malo y cuenta inactiva), GET /api/usuarios plano, dashboard counts, build frontend. Commit único de fase C. Route: inline.

## Log

- L1 (verbatim): "bueno escucha primera cosa a corregir, necesito que usuarios, alumnos, docentes, tutores, sea una generalizacion es decir que todos los usuarios tengan en comun lo que tienen alumnos,docentes y tutores, y que cada uno tenga en su tabla sus propis atributos distintivos se entiende? que te parece?"
- L2: Pregunta de diseño respondida con opción "No, usuarios queda separado" y corregida por el usuario: "espera no quise responder eso, hereda de persona si" → usuarios hereda de personas, dni opcional.
- L3: Alcance relevado: 7 repos tocan `prisma.alumno|docente|tutor|usuario` directamente (alumnos, auth, dashboard, docentes, reportes, tutores, usuarios); ~8 repos más anidan `include: { alumno/docente }` (asistencia, cursos, inscripcion, materias, calificaciones, curso-materia, modulos-mensuales, dias-sin-clases). Servicios no tocan Prisma directo.
- L4: Riesgo: ítem 1 (migración de datos existentes) y ítem 3 (contrato consumido por frontend) → backup obligatorio, shape plano para no romper el frontend, verificación con deploy scratch.
- L5: Implementación y verificación: migración `20261119040000_generalizacion_personas` aplicada (987 personas, backfill verificado); bug encontrado durante verificación — el SQL olvidaba DROP nombre/apellido de usuarios (P2011 en seed), corregido en el mismo archivo. Un proceso viejo `node dist/src/main` retenía :3000 con un build antiguo (causó un 500 engañoso en el primer smoke; era un proceso zombi, no código nuevo). Verificación final: tsc 0 errores, seed OK, migrate deploy desde cero OK, smoke HTTP completo OK (login 200, alumnos CRUD plano, dashboard 337/60/7), frontend build OK sin cambios de código.
- L6: Native review (lentes risk+reliability, consentimiento granted, commit 900 líneas): terminó en stop `native_stop_required` con finding `R3-mig-usuarios-001` corroborado (backfill de usuarios mapea por nombre+apellido; con dos usuarios homónimos podría vincular dos filas a la misma persona — en datos actuales los 7 usuarios tienen nombre+apellido únicos, sin efecto) y `R3-usuarios-rol-shape-001` con causalidad desconocida (shape de `rol` en UsuarioResponse; include siempre trae rol, shape preservado). Ambos quedan como follow-ups informativos; revisión terminal, entrega por política ordinaria.
- L7: Blindaje del finding R3-mig-usuarios-001 (decisión del usuario): backfill de usuarios reescrito con emparejamiento 1:1 determinista por `nombre_usuario` UNIQUE mediante columna temporal `_usuario_nombre` en personas (dropeada al final de la misma migración). Verificado: prueba RED-style con dos homónimos (Ana Perez ×2) → 2 personas distintas, cada usuario a la suya; migrate deploy desde cero OK en scratch.
