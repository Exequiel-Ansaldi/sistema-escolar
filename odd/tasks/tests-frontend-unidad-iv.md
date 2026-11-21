# Tests del frontend — Unidad IV (cátedra Aguirre, UNER)

Objetivo: cubrir el frontend con la estructura de la Unidad IV: presentacionales con props (sin red, con eventos), Service Layer del cliente con dobles, hooks headless, y RBAC puro. Infra: Vitest 3 + Testing Library + jsdom.

Fuentes: `Documents/Facultad/Programacion V/Teoria/Unidad IV - Clase 1 - Componentes.md`, `Clase 2 - Diseño y DI.md`, `Ejemplo - Pantalla Login.md`.

Branch: `main` · Runner: Vitest (`npm test` en frontend) · Patrón de la cátedra aplicado: "En un test, `onLogin` es una función falsa"; "Se prueba sin red"; Testing Library con semántica accesible (labels asociadas, `aria-invalid`, `role="alert"`); componente presentacional = props + eventos; solo la página conoce el servicio.

## Specs

S1 (verbatim): "hace primero los tests del front, tengo clases, es la nidad IV".

S2 (infra): Vitest 3 + @testing-library/react 16 + jsdom + user-event + jest-dom. Config en `vitest.config.ts` (environment jsdom, setup con jest-dom). Scripts: `npm test` (run) y `npm run test:coverage` opcional.

S3 (unitarios por capa):
- **Service Layer** (`services/api.ts`): `request` agrega `Authorization: Bearer <token>` de `localStorage`, Content-Type JSON; error de red lanza con `message` del body (fallback statusText); `login` POST con body JSON; `getAll*` extrae `.data` del paginado.
- **RBAC puro** (`constants/roles.ts`): `puedeAcceder` (admin/rector pasan siempre; ruta sin entrada en el mapa → true; restringida → rol fuera false); `puedeEscribir` (asesoria_pedagogica solo lectura en /alumnos — regla del commit a50b44d); `rutaInicial` por rol (vicerrector → `/`, preceptor → `/asistencias`).
- **Presentacionales** (`components/ui.tsx`): `DataTable` (headers, filas, botones editar/eliminar con callbacks), `Badge` variantes, `ConfirmModal` (confirmar/cancelar), `Input` (label asociada `htmlFor`, `onChange` entrega el valor).
- **Hook headless** (`hooks/useCrud.ts`): load/create/update/delete con la api mockeada (vi.mock), toasts y recarga tras mutaciones.
- **Contenedor** (`pages/Login.tsx`): con api mockeada — éxito guarda token en localStorage y navega; credenciales inválidas → mensaje de error visible, sin revelar cuál campo falló (cátedra §4.4).
- **Protección de rutas** (`App.tsx`/ProtectedRoute): sin token → redirige a `/login`; con rol sin acceso a la ruta → `rutaInicial(rol)`.

S4 (CI): job frontend de `.github/workflows/tests.yml` corre `npm test` antes del build.

S5 Acceptance: (a) `npm test` verde en frontend con TODOS los specs; (b) el build sigue pasando; (c) CI corre los tests del frontend; (d) commits en slices.

## Tasks

- T1 (S2): infra Vitest + setup + smoke test. Route: inline. ✅ hecha (Vitest 5.1.1 + RTL + jsdom + jest-dom; scripts test/test:watch/test:coverage; build intacto).
- T2 (S3): specs service layer + RBAC + useCrud + AuthContext. Route: delegated (writer W1). ✅ hecha (32 tests; hallazgos: rutaInicial(preceptor)=/cursos por orden de inserción; rutas sin entrada en el mapa accesibles para todos; useCrud propaga errores de load).
- T3 (S3): specs presentacionales + Login + protección de rutas. Route: delegated (writer W2). ✅ hecha (24 tests; hallazgos documentados sin corregir: labels sin htmlFor/id en Input/Select/Login, error sin role="alert", rebote de hidratación de ProtectedRoute al deep-link).
- T4 (S4/S5): CI + docs + verificación completa + commits. Route: inline. ✅ hecha (job frontend corre npm test antes del build; READMEs actualizados; 62/62 verdes + build typecheck limpio).

## Log

- L1 (verbatim): "hace primero los tests del front, tengo clases, es la nidad IV".
- L2: Leídas las 3 piezas de la Unidad IV (Componentes; Diseño y DI — service layer del cliente inyectable, "se prueba sin red"; Ejemplo Login — estado como unión, onLogin fake, Testing Library). Frontend: React 19 + Vite 8, sin infra de test. `services/api.ts` = service layer (fetch + token de localStorage); `constants/roles.ts` = RBAC puro (RUTAS_POR_ROL, puedeEscribir, rutaInicial); `useCrud` = hook genérico; `ui.tsx` = átomos presentacionales; Login/AUTH pages = contenedores.
