# Testing completo de la API — unitarios/integración/e2e (pedido explícito)

Objetivo: cubrir TODOS los endpoints de la API con la estructura de la Unidad V: unitarios (controllers con service mock), integración de API vía HTTPS/Supertest (base de datos real: transacciones, concurrencia, validación) y e2e de flujos críticos (pocos).

Branch: `main` · Runner: jest (`npm test`, `npm run test:e2e` con `test/jest-e2e.json`) · Inventario: 20 controllers, ~85 endpoints. Transacciones reales en 3 repos: `usuarios.repository` (persona+cuenta), `curso-materia.repository` (`asignarMasivo`), `modulos-mensuales.repository` (upsert/delete con hijos).

## Specs

S1 (verbatim): "necesito que testees todos los endpoitns de la api, mediante test unitarios, los test de integracion serian https, base de datos transacciones, concurrencia, etc y e2e flujos criticos, pocos".

S2 (unitarios): un `<modulo>.controller.spec.ts` por cada controller, patrón de la cátedra ya en uso (`createTestingModule` + `overrideProvider`/`useValue` con mocks `jest.fn()`), verificando resultado Y argumentos. Controllers: auth, usuarios, alumnos, cursos, curso-materia, docentes, docente-materia, materias, inscripcion, asistencia, calificaciones, actas, acuerdos, seguimiento, tutores, licencias, modulos-mensuales, dias-sin-clases, dashboard, reportes. (health ya está hecho.)

S3 (integración Supertest, DB real): (a) transacciones: POST masivo cursos-materias idempotente (asignados/omitidos), upsert módulos-mensuales con hijos — entrada inválida (suma no cierra → 400) deja CERO filas nuevas, DELETE limpia cascada; usuarios POST crea persona+cuenta en una transacción, duplicado de nombreUsuario rechazado. (b) concurrencia: 5 POST paralelos de la misma inscripción → exactamente 1 creado, el resto 409 (no 500); mismo race con dni de alumno. (c) validación: cuerpos con campo extra → 400 (forbidNonWhitelisted).

S4 (e2e flujos críticos, POCOS): (1) flujo académico: login → crear curso → crear alumno → inscribir → registrar asistencia → cargar calificación → dashboard resumen → PDF calificaciones (%PDF) → cleanup (desinscribir + soft-deletes). (2) flujo licencias: crear → aprobar → finalizar → transición inválida 400 → listar → DELETE cleanup.

S5 Acceptance: (a) `npm test` y `npm run test:e2e` completamente verdes; (b) cada controller tiene spec; (c) hallazgos de bugs se corrigen o quedan documentados en el Log; (d) commits en slices revisables.

## Tasks

- T1 (S2): specs batch 1 — usuarios, alumnos, cursos, curso-materia, docentes, docente-materia, materias, dias-sin-clases, tutores, actas. Route: delegated (writer W1). ✅ hecha (10 suites, 49 tests; alumnos ampliado preservando los 3 originales).
- T2 (S2): specs batch 2 — calificaciones, asistencia, licencias, modulos-mensuales, inscripcion, acuerdos, seguimiento, dashboard, reportes, auth. Route: delegated (writer W2). ✅ hecha (97 tests en su filtro; RED→GREEN: await en metodos sincronicos de controller y metadata `__httpCode__` de Nest 11).
- T3 (S3): specs de integración: transacciones + concurrencia + validación; corrección mínima de mapeo de error si la concurrencia revela 500 que debieran ser 409. Route: inline. ✅ hecha (7 tests; BUG REAL corregido: inscripcion/alumnos/usuarios no mapeaban P2002 → 500 en race; ahora 409. Hallazgos de shapes reales: `factor` es enum, grupos responde `{data}`, anio del query filtra el CURSO, rolId debe leerse del seed vivo).
- T4 (S4): e2e flujos críticos (académico + licencias). Route: inline. ✅ hecha (14 tests; hallazgos: asistencia default = ausente, dashboard resumen expone `asistenciaHoy`).
- T5 (S5): suite completa + commits por fase. Route: inline. ✅ hecha (149 unitarios + 32 integración/e2e = 181/181 verdes; 4 commits: b507ac5, 480d820, 2f204dc, 92a2358; push pendiente del usuario).

## Log

- L1 (verbatim): "necesito que testees todos los endpoitns de la api, mediante test unitarios, los test de integracion serian https, base de datos transacciones, concurrencia, etc y e2e flujos criticos, pocos".
- L2: Inventario: 20 controllers (~85 endpoints). Transacciones: `usuarios.repository.$transaction` (línea 71), `curso-materia.repository.asignarMasivo` ($transaction con createMany filtrado — idempotente por diseño, sin error a mitad de transacción), `modulos-mensuales.repository` (upsert/delete con hijos, líneas 109/150). Concurrencia candidata: inscripcion.create y alumnos.create no mapean P2002 (duplicado único) → posible 500 en race; verificación en T3.
