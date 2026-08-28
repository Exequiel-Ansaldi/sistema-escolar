<div align="center">

# 🏫 Sistema de Gestión Escolar

**Plataforma integral para la administración de una escuela secundaria.**
Gestioná alumnos, docentes, cursos, asistencias, calificaciones y reportes en un solo lugar.

[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-lightgrey.svg)](#licencia)

---

### 🚀 Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

</div>

---

## ✨ Características

- **Gestión académica** — Alumnos, docentes, cursos y materias.
- **Seguimiento** — Inscripciones, asistencias y calificaciones por trimestre.
- **Legajo docente** — Licencias y módulos mensuales dictados/no dictados.
- **Calendario escolar** — Días sin clases: feriados, paros y asambleas (globales o por curso).
- **Intervenciones** — Actas, acuerdos, seguimientos y tutores.
- **Dashboard** — Aprobados por curso (apilado por turno) y promedio por año.
- **Control de acceso (RBAC)** — 7 roles con permisos diferenciados protegidos en el backend.
- **Paginación servidor-cliente** en todas las páginas.
- **Reportes en PDF** descargables para los roles habilitados.

## 🧱 Estructura del proyecto

```
PROYECTO_LUCI/
├── backend/          # API REST (NestJS + Prisma)
├── frontend/         # SPA (React + Vite)
├── start.js          # Levanta backend + frontend juntos en desarrollo
├── .env.example      # Variables de entorno de referencia
├── render.yaml       # Config de deploy del backend (Render)
└── package.json      # Scripts raíz
```

- **`backend/`** — Arquitectura en capas `Controller → Service → Repository → PrismaService`. Cada módulo de negocio vive en `src/modules/<modulo>/` con sus DTOs y repositorios. → [`backend/README.md`](backend/README.md)
- **`frontend/`** — SPA con rutas protegidas, cliente HTTP centralizado y CRUD genérico con paginación. → [`frontend/README.md`](frontend/README.md)

### Módulos del backend

`actas` · `acuerdos` · `alumnos` · `asistencia` · `auth` · `calificaciones` · `cursos` · `dashboard` · `dias-sin-clases` · `docentes` · `inscripcion` · `licencias` · `materias` · `modulos-mensuales` · `reportes` · `seguimientos` · `tutores` · `usuarios`

### Páginas del frontend

`/login` · `/` (dashboard) · `/alumnos` · `/cursos` · `/docentes` · `/materias` · `/inscripciones` · `/asistencias` · `/calificaciones` · `/actas` (actas/acuerdos/seguimientos/tutores) · `/licencias` · `/modulos` · `/carga-horaria` · `/calendario`

## ✅ Requisitos previos

- Node.js 20+
- PostgreSQL (local o Supabase)
- npm

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Exequiel-Ansaldi/sistema-escolar.git
cd sistema-escolar
```

### 2. Instalar dependencias

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `backend/.env` y completar la conexión a PostgreSQL, el secreto JWT y el origen CORS:

```bash
cp .env.example backend/.env
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Supabase en producción) |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Duración del token (ej. `8h`) |
| `CORS_ORIGIN` | URL del frontend permitido |
| `PORT` | Puerto del backend (Render lo setea automáticamente) |

### 4. Aplicar migraciones y sembrar la base de datos

```bash
cd backend
npx prisma migrate dev
npm run seed
```

El seed genera datos deterministas (roles, usuarios, 21 cursos, 25 materias, 60 docentes, 300 alumnos, asistencias, calificaciones, módulos y licencias) y un usuario por rol con contraseña `usuario + "123"`.

## ▶️ Ejecución en desarrollo

Levanta backend (puerto 3000) y frontend (puerto 5173) a la vez:

```bash
npm run dev
```

O por separado:

```bash
# Backend (recarga automática)
npm --prefix backend run start:dev

# Frontend
npm --prefix frontend run dev
```

## 🔑 Credenciales de prueba (seed)

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin | `admin` | `admin123` |
| Rector | `rector` | `rector123` |
| Vicerrector | `vicerrector` | `vicerrector123` |
| Secretaría Personal | `secretaria_personal` | `secretaria_personal123` |
| Secretaría Alumnado | `secretaria_alumnado` | `secretaria_alumnado123` |
| Asesoría Pedagógica | `asesoria_pedagogica` | `asesoria_pedagogica123` |
| Preceptor Mañana | `preceptor_manana` | `preceptor_manana123` |

> `admin` siempre tiene acceso; el resto queda definido por los guards en el backend. El dashboard está reservado a `rector` y `vicerrector`.

## 🔧 Scripts útiles

### Raíz

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Levanta backend + frontend juntos |
| `npm run seed` | Borra y resiembra la base de datos |

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Dev con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start:prod` | Corre la build de producción |
| `npm run lint` | ESLint |
| `npm run seed` | Borra y resiembra la BD con datos deterministas |
| `npm run test` | Tests unitarios (Jest) |
| `npx prisma studio` | Navegador visual de la base de datos |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server (puerto 5173, proxy `/api` → localhost:3000) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | oxlint |
| `npm run preview` | Sirve el build de producción |

## 🛡️ Autenticación y roles (RBAC)

- Todo endpoint (excepto el login público) está protegido con `JwtAuthGuard` + `RolesGuard` y anotado con `@Roles(...)`.
- El frontend filtra el menú según el rol y redirige a la ruta inicial del rol; la defensa real está en los guards del backend.
- El dashboard está restringido a `rector` y `vicerrector`.
- Los reportes en PDF requieren JWT + rol; el frontend los descarga con `fetch` + `Authorization` (nunca `window.open`).

## 📌 Convenciones del backend

- **Capas**: `Controller → Service → Repository → PrismaService`. Solo los repositorios inyectan `PrismaService`.
- **DTOs de entrada**: clases `class-validator` (ej. `crear-alumno.dto.ts`); los DTOs de consulta extienden `PaginacionQueryDto`.
- **DTOs de salida**: interfaces `*Response` (ej. `alumno-response.ts`). No se usa `any`.
- **Fechas**: Prisma devuelve `Date`; los repositorios serializan a ISO `string` porque el contrato del frontend usa strings.
- **Paginación**: patrón `skip`/`take` con `PaginatedResult<T>` (`total`, `page`, `limit`, `totalPages`).
- `POST /api/asistencias/masivo` recibe `{ datos: [...] }`.

## 🌐 API REST

Todas las rutas llevan el prefijo `/api`. Ejemplos:

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/login` | Login público, devuelve JWT |
| `GET /api/alumnos` | Lista paginada de alumnos |
| `GET /api/dashboard/aprobados-por-curso` | Aprobados por curso (agrupado por año y turno) |
| `GET /api/dashboard/promedio-por-anio` | Promedio general por año |
| `GET /api/reportes/...` | Reportes (PDF) |

## ☁️ Despliegue

- **Backend** → [Render](https://render.com) usando [`render.yaml`](render.yaml) (build: `prisma generate` + `npm run build`; start: `node dist/src/main.js`).
- **Frontend** → [Vercel](https://vercel.com) usando [`vercel.json`](frontend/vercel.json), que redirige `/api/*` al backend en Render y aplica el SPA catch-all.

## 📄 Licencia

Sin licencia definida (proyecto privado).
