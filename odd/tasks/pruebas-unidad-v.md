# Pruebas Unidad V — reestructuración de la suite + CI

Objetivo: alinear la suite de pruebas del backend a la estructura de la Unidad V (cátedra Aguirre, UNER): unitarios con `Test.createTestingModule` + `overrideProvider`, integración de API con Supertest (los "e2e" de Nest) repitiendo los globals de `main.ts` y con guarda JWT real, cobertura con exclusiones sensatas, y pipeline de GitHub Actions.

Fuentes: `Documents/Facultad/Programacion V/Teoria/Unidad V - Clase 1 - Testing, TDD y BDD.md` y `Unidad V - Testing de APIs con NestJS.md`.

Branch: `main` · Runner: jest (`npm test`, `npm run test:e2e` con `test/jest-e2e.json`) · Reglas de la cátedra aplicadas: comportamiento observable, AAA, FIRST, caminos de error incluidos, `test.each` para tablas de casos, pirámide (muchos unitarios, pocos de integración), cobertura guía no meta.

## Specs

S1 (petición del usuario, verbatim): "vamos con las pruebas, ya sabemos que anda todo pero quiero que sigan cierta estructura si, leete la unidad 5 de programacion V para que veas como estructurar las pruebas, para luego configurar ci/cd pipline y esas cosas".

S2 (unitarios): los specs existentes (licencias, asistencia, reportes) se migran a `Test.createTestingModule` con `overrideProvider` (mocks como clases) conservando TODOS los casos actuales (26). Nuevos specs de servicios con reglas: inscripcion (404 alumno/curso, 409 duplicado), cursos (409 unicidad (año,división,turno) en create/update), alumnos (409 dni), auth (401 credenciales, 401 cuenta inactiva, token), modulos-mensuales (invariante 400). Un controller spec representativo (alumnos) con service mock verificando resultado + argumentos.

S3 (integración de API): `test/*.e2e-spec.ts` con Supertest contra AppModule en memoria: repetir globals de `main.ts` (ValidationPipe whitelist+forbidNonWhitelisted+transform, `setGlobalPrefix('api')`), **guarda JWT real** (login real por `/api/auth/login`), PostgreSQL local real (gestionada → real, según la cátedra). Spec 1 `auth`: login 200 + accessToken, credenciales malas 401, endpoint protegido sin token 401. Spec 2 `rbac-alumnos`: GET admin 200, GET asesoria 200 (regla de lectura), POST asesoria 403, POST rector 201 + DELETE cleanup. Seed (`npm run seed`) en `beforeAll` de specs que escriben.

S4 (cobertura): `coveragePathIgnorePatterns` para `*.module.ts`, `main.ts`, `*.dto.ts`, `dto/`, `prisma/`, `seed.ts`. Umbral NO obligatorio (la cobertura guía).

S5 (CI): `.github/workflows/tests.yml`: job backend (npm ci → build → test → test:cov → test:e2e con service container postgres + `prisma migrate deploy` + seed), job frontend (npm ci → build). Triggers push/PR a main.

S6: Acceptance: (a) `npm test` verde con TODOS los casos actuales preservados; (b) `npm run test:e2e` verde con Postgres local arriba; (c) `npm run test:cov` genera reporte sin inflar con DTOs/main; (d) backend `npm run build` y frontend `npm run build` verdes; (e) smoke real no afectado (26→N tests).

## Tasks

- T1 (S2): migrar specs licencias/asistencia/reportes a createTestingModule + overrideProvider (mocks-clase). Route: inline.
- T2 (S2): specs nuevos de servicios (inscripcion, cursos, alumnos, auth, modulos-mensuales) con test.each donde aplique + controller spec de alumnos. Route: inline.
- T3 (S3): `test/jest-e2e.json` + helper de bootstrap (globals de main.ts) + specs auth y rbac-alumnos con DB real. Route: inline.
- T4 (S4): config de cobertura en package.json. Route: inline.
- T5 (S5): workflow de GitHub Actions (backend con postgres service + frontend). Route: inline.
- T6 (S6): verificación completa + commits por fase + push. Route: inline.

## Log

- L1 (verbatim): "okay otra cosa, que cambiar asesoria pedagogica tiene que ver alumnos, porque si no los ve no puede analizar las actas, pero no puede hacer baja ni alta ni modificacion, pero no estaria bueno que se vea eso en la side bar" → implementado en commit a50b44d (lectura asesoría). — no corresponde a esta feature, registrado por trazabilidad.
- L2 (verbatim): "buenisimo, otra cosa, vamos con las pruebas, ya sabemos que anda todo pero quiero que sigan cierta estructura si, leete la unidad 5 de programacion V para que veas como estructurar las pruebas, para luego configurar ci/cd pipline y esas cosas".
- L3: Leídas Clase 1 (pirámide, dobles, FIRST, TDD/BDD) y la clase práctica de NestJS (createTestingModule/overrideProvider, Supertest, trampa de main.ts, seguridad con guarda real, yml de CI). Estado actual: 3 specs unitarios (26 tests) con inyección manual; sin test/; sin CI. Deps ya instaladas (@nestjs/testing, supertest, jest 30).
- L4: Decisión DB para integración: real local (gestionada → real según la cátedra); el proyecto NO usa sql.js/TypeORM como el proyecto de clase, la equivalencia es Prisma + Postgres local. Seed en beforeAll de specs que escriben (las secuencias no se resetean — gotcha conocido).
