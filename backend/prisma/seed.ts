import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── RNG determinista (mulberry32): misma semilla → mismos datos ──
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260730);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randomInt(min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}
function hsDe(modulos: number): number {
  return Math.round((modulos * 40) / 60);
}

const NOMBRES = [
  'Lautaro', 'Mía', 'Tomás', 'Sofía', 'Benjamín', 'Valentina', 'Joaquín', 'Catalina',
  'Mateo', 'Martina', 'Thiago', 'Emma', 'Bautista', 'Julia', 'Felipe', 'Camila',
  'Santino', 'Renata', 'Ignacio', 'Victoria', 'Agustín', 'Pilar', 'Nicolás', 'Milagros',
  'Facundo', 'Agustina', 'Franco', 'Morena', 'Marcos', 'Antonella', 'Julián', 'Abril',
  'Gonzalo', 'Lourdes', 'Federico', 'Candela', 'Ramiro', 'Isabella', 'Bruno', 'Guadalupe',
  'Valentín', 'Delfina', 'Ezequiel', 'Olivia', 'Nahuel', 'Jazmín', 'Sebastián', 'Melina',
];

const APELLIDOS = [
  'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García', 'Pérez', 'Gómez',
  'Díaz', 'Álvarez', 'Romero', 'Sosa', 'Torres', 'Ramírez', 'Sánchez', 'Morales',
  'Ortiz', 'Herrera', 'Acosta', 'Medina', 'Flores', 'Castro', 'Peralta', 'Benítez',
  'Godoy', 'Silva', 'Rojas', 'Cabrera', 'Vega', 'Domínguez', 'Molina', 'Giménez',
  'Juárez', 'Aguirre', 'Ríos', 'Coronel', 'Roldán', 'Luna', 'Cáceres', 'Bustos',
  'Vera', 'Corvalán', 'Lucero', 'Pereyra', 'Chávez', 'Mansilla', 'Barrios', 'Ávalos',
];

const CALLES = [
  'Av. San Martín', 'Calle Belgrano', 'Rivadavia', 'Mitre', 'Sarmiento', '9 de Julio',
  'Alberdi', 'Laprida', 'Moreno', '25 de Mayo', 'Urquiza', 'Saavedra', 'Viamonte',
  'Entre Ríos', 'Corrientes', 'Av. Colón', 'Belgrano', 'Maipú', 'Tucumán', 'Italia',
];

// ── Planes de materias por curso (módulos de 40 min / semana). Suma ≈ 52-55 → 35 hs cátedra ──
const PLAN_CICLO_BASICO: [string, number][] = [
  ['Matemática', 8], ['Lengua y Literatura', 7], ['Inglés', 5], ['Historia', 4],
  ['Geografía', 4], ['Ciencias Naturales', 5], ['Educación Física', 3],
  ['Formación Ética y Ciudadana', 3], ['Música', 3], ['Artes Visuales', 3],
  ['Tecnología', 3], ['Informática', 4],
];
const PLAN_HUMANIDADES: [string, number][] = [
  ['Matemática', 6], ['Lengua y Literatura', 6], ['Inglés', 4], ['Historia', 5],
  ['Geografía', 4], ['Educación Física', 2], ['Formación Ética y Ciudadana', 2],
  ['Filosofía', 3], ['Sociología', 3], ['Psicología', 4], ['Historia del Arte', 4],
  ['Metodología de la Investigación', 4], ['Taller de Lectura y Escritura', 5],
];
const PLAN_MATEMATICAS: [string, number][] = [
  ['Matemática', 6], ['Lengua y Literatura', 5], ['Inglés', 4], ['Historia', 3],
  ['Geografía', 3], ['Educación Física', 2], ['Formación Ética y Ciudadana', 2],
  ['Análisis Matemático', 5], ['Álgebra', 5], ['Probabilidad y Estadística', 5],
  ['Programación', 6], ['Física', 3], ['Biología', 3], ['Química', 3],
];

const CATALOGO_MATERIAS = [
  'Matemática', 'Lengua y Literatura', 'Inglés', 'Historia', 'Geografía',
  'Ciencias Naturales', 'Biología', 'Física', 'Química', 'Educación Física',
  'Formación Ética y Ciudadana', 'Música', 'Artes Visuales', 'Tecnología', 'Informática',
  'Filosofía', 'Sociología', 'Psicología', 'Historia del Arte', 'Metodología de la Investigación',
  'Taller de Lectura y Escritura', 'Análisis Matemático', 'Álgebra', 'Probabilidad y Estadística', 'Programación',
];

const DOCENTES_POR_MATERIA: [string, number][] = [
  ['Matemática', 5], ['Lengua y Literatura', 5], ['Inglés', 4], ['Historia', 4],
  ['Geografía', 4], ['Ciencias Naturales', 3], ['Biología', 3], ['Física', 3], ['Química', 3],
  ['Educación Física', 2], ['Formación Ética y Ciudadana', 2], ['Música', 2], ['Artes Visuales', 2],
  ['Tecnología', 2], ['Informática', 2], ['Filosofía', 2], ['Sociología', 2], ['Psicología', 2],
  ['Historia del Arte', 2], ['Metodología de la Investigación', 2], ['Taller de Lectura y Escritura', 2],
  ['Análisis Matemático', 3], ['Álgebra', 3], ['Probabilidad y Estadística', 3], ['Programación', 3],
];

async function main() {
  console.log('🌱 Iniciando seed realista (determinista)...\n');

  // ── Limpieza (ordenado por dependencias) ──
  await prisma.moduloSemanal.deleteMany();
  await prisma.licencia.deleteMany();
  await prisma.docenteMateria.deleteMany();
  await prisma.cursoMateria.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.calificacion.deleteMany();
  await prisma.acuerdo.deleteMany();
  await prisma.acta.deleteMany();
  await prisma.seguimiento.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.diaSinClases.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();

  // ── Roles y usuarios ──
  const adminRol = await prisma.rol.create({ data: { nombreRol: 'admin' } });
  const preceptorRol = await prisma.rol.create({ data: { nombreRol: 'preceptor' } });
  const hash = await bcrypt.hash('admin123', 10);
  const hashPre = await bcrypt.hash('preceptor123', 10);
  await prisma.usuario.create({ data: { nombreUsuario: 'admin', contrasena: hash, nombre: 'Admin', apellido: 'Sistema', rolId: adminRol.id } });
  await prisma.usuario.create({ data: { nombreUsuario: 'preceptor', contrasena: hashPre, nombre: 'Carlos', apellido: 'López', rolId: preceptorRol.id } });
  console.log('✅ Roles y usuarios: admin (admin/admin123), preceptor (preceptor/preceptor123)');

  // ── Cursos (1°-6° × A/B/C = 18) ──
  const cursos: any[] = [];
  for (let anio = 1; anio <= 6; anio++) {
    for (const division of ['A', 'B', 'C']) {
      const orientacion = anio <= 3 ? 'Ciclo Básico' : (division === 'C' ? 'Matemáticas' : 'Humanidades');
      const turno = division === 'A' ? 'mañana' : 'tarde';
      cursos.push(await prisma.curso.create({
        data: { anio, division, turno, orientacion, cicloLectivo: 2026 },
      }));
    }
  }
  console.log(`✅ Cursos: ${cursos.length} (1°-6° × A/B/C, orientaciones: Ciclo Básico / Humanidades / Matemáticas)`);

  // ── Materias (25) ──
  const materias = [];
  for (const nombre of CATALOGO_MATERIAS) {
    materias.push(await prisma.materia.create({ data: { nombre } }));
  }
  const materiaId: Record<string, number> = Object.fromEntries(materias.map(m => [m.nombre, m.id]));
  console.log(`✅ Materias: ${materias.length}`);

  // ── Docentes (60) ──
  const docenteRows = Array.from({ length: 60 }, (_, i) => ({
    dni: String(25000000 + i + 1),
    nombre: pick(NOMBRES),
    apellido: pick(APELLIDOS),
    telefono: `11${String(10000000 + ((i * 7919) % 89999999))}`,
    email: `docente${i + 1}@escuela.edu`,
    fechaIngreso: new Date(2008 + randomInt(0, 17), randomInt(0, 11), randomInt(1, 28)),
  }));
  await prisma.docente.createMany({ data: docenteRows });
  const docentes = await prisma.docente.findMany({ orderBy: { id: 'asc' } });
  console.log(`✅ Docentes: ${docentes.length}`);

  // ── DocenteMateria: cada docente habilitado en 1-3 materias ──
  const poolPorMateria: Record<number, number[]> = {};
  const docenteMateriaRows: { docenteId: number; materiaId: number }[] = [];
  let cursorDocente = 0;
  for (const [nombre, cantidad] of DOCENTES_POR_MATERIA) {
    const ids: number[] = [];
    for (let j = 0; j < cantidad; j++) {
      const docenteId = docentes[cursorDocente % docentes.length].id;
      cursorDocente++;
      ids.push(docenteId);
      docenteMateriaRows.push({ docenteId, materiaId: materiaId[nombre] });
    }
    poolPorMateria[materiaId[nombre]] = ids;
  }
  await prisma.docenteMateria.createMany({ data: docenteMateriaRows });
  console.log(`✅ DocenteMateria: ${docenteMateriaRows.length} habilitaciones`);

  // ── CursoMateria + docente por (curso, materia) ──
  const planDe = (curso: any): [string, number][] =>
    curso.anio <= 3 ? PLAN_CICLO_BASICO : (curso.orientacion === 'Matemáticas' ? PLAN_MATEMATICAS : PLAN_HUMANIDADES);

  const cursoMateriaRows: { cursoId: number; materiaId: number; cargaHoraria: number; modulosPorSemana: number }[] = [];
  const moduloDocentes = new Map<string, number>();
  const contadorMateria: Record<number, number> = {};
  const cursoMaterias = new Map<number, { materiaId: number; modulosPorSemana: number }[]>();

  for (const curso of cursos) {
    const items: { materiaId: number; modulosPorSemana: number }[] = [];
    for (const [nombre, modulos] of planDe(curso)) {
      const mid = materiaId[nombre];
      contadorMateria[mid] = (contadorMateria[mid] ?? 0) + 1;
      const pool = poolPorMateria[mid];
      const docenteId = pool[contadorMateria[mid] % pool.length];
      cursoMateriaRows.push({ cursoId: curso.id, materiaId: mid, cargaHoraria: hsDe(modulos), modulosPorSemana: modulos });
      moduloDocentes.set(`${curso.id}:${mid}`, docenteId);
      items.push({ materiaId: mid, modulosPorSemana: modulos });
    }
    cursoMaterias.set(curso.id, items);
  }
  await prisma.cursoMateria.createMany({ data: cursoMateriaRows });
  console.log(`✅ CursoMateria: ${cursoMateriaRows.length} asignaciones (35 hs cátedra/semana por curso)`);

  // ── Alumnos (300) ──
  const alumnosPorCurso = cursos.map((_, i) => (i < 12 ? 17 : 16)); // 12×17 + 6×16 = 300
  const alumnoRows: any[] = [];
  const alumnoCurso: number[] = [];
  let dni = 40100000;
  for (let ci = 0; ci < cursos.length; ci++) {
    for (let j = 0; j < alumnosPorCurso[ci]; j++) {
      dni++;
      const anio = cursos[ci].anio;
      const inactivo = dni % 30 === 0;
      alumnoRows.push({
        dni: String(dni),
        nombre: pick(NOMBRES),
        apellido: pick(APELLIDOS),
        nacimiento: new Date(2015 - anio, randomInt(0, 11), randomInt(1, 28)),
        direccion: `${pick(CALLES)} ${randomInt(100, 2400)}`,
        telefono: `11${String(10000000 + ((dni * 7919) % 89999999))}`,
        estado: inactivo ? 'inactivo' : 'activo',
        fechaIngreso: new Date(`${2027 - anio}-03-01`),
        fechaEgreso: inactivo ? new Date(2026, 6, 15) : null,
      });
      alumnoCurso.push(ci);
    }
  }
  await prisma.alumno.createMany({ data: alumnoRows });
  const alumnos = await prisma.alumno.findMany({ orderBy: { id: 'asc' } });
  const inactivos = alumnos.filter(a => a.estado === 'inactivo').length;
  console.log(`✅ Alumnos: ${alumnos.length} (${inactivos} inactivos)`);

  // ── Inscripciones ──
  const inscripcionRows = alumnos.map((al, i) => ({
    alumnoId: al.id,
    cursoId: cursos[alumnoCurso[i]].id,
    fechaInscripcion: new Date(`${2027 - cursos[alumnoCurso[i]].anio}-03-01`),
    estado: al.estado === 'inactivo' ? 'inactivo' : 'activo',
  }));
  await prisma.inscripcion.createMany({ data: inscripcionRows });
  console.log(`✅ Inscripciones: ${inscripcionRows.length}`);

  // ── Días sin clases (julio 2026) ──
  const id4C = cursos[11].id;
  await prisma.diaSinClases.createMany({
    data: [
      { fecha: new Date(Date.UTC(2026, 6, 9)), tipo: 'feriado', descripcion: 'Día de la Independencia' },
      { fecha: new Date(Date.UTC(2026, 6, 15)), tipo: 'paro', descripcion: 'Paro docente nacional' },
      { fecha: new Date(Date.UTC(2026, 6, 22)), tipo: 'paro', descripcion: 'Paro en la división', cursoId: id4C },
    ],
  });
  console.log('✅ Días sin clases: feriado 09/07, paro 15/07, paro 22/07 (4°C)');

  // ── Asistencias (solo inasistencias, días hábiles de julio) ──
  const diasClase: Date[] = [];
  for (let d = 1; d <= 31; d++) {
    const fecha = new Date(Date.UTC(2026, 6, d));
    const diaSem = fecha.getUTCDay();
    if (diaSem === 0 || diaSem === 6) continue;
    if (d === 9 || d === 15) continue;
    diasClase.push(fecha);
  }
  const asistenciaRows: any[] = [];
  for (const fecha of diasClase) {
    for (let i = 0; i < alumnos.length; i++) {
      if (alumnos[i].estado !== 'activo') continue;
      if (fecha.getUTCDate() === 22 && alumnoCurso[i] === 11) continue;
      if (rand() < 0.10) {
        const justificado = rand() < 0.40;
        asistenciaRows.push({
          alumnoId: alumnos[i].id,
          fecha,
          estado: justificado ? 'justificado' : 'ausente',
          justificacion: justificado ? pick(['Médica', 'Familiar', 'Personal']) : null,
          observacion: !justificado && rand() < 0.25 ? pick(['Llegó tarde', 'Retiro antes de finalizar la jornada', 'Sin aviso previo']) : null,
        });
      }
    }
  }
  for (let i = 0; i < asistenciaRows.length; i += 1000) {
    await prisma.asistencia.createMany({ data: asistenciaRows.slice(i, i + 1000) });
  }
  console.log(`✅ Asistencias (inasistencias): ${asistenciaRows.length} en ${diasClase.length} días hábiles`);

  // ── Calificaciones (T1 y T2 completos + T3 parcial) ──
  const notasPonderadas = (): number => {
    const r = rand();
    if (r < 0.02) return 4;
    if (r < 0.08) return 5;
    if (r < 0.26) return 6;
    if (r < 0.51) return 7;
    if (r < 0.76) return 8;
    if (r < 0.91) return 9;
    return 10;
  };
  const obsNota = (nota: number): string | null =>
    nota <= 5 ? 'Necesita mejorar' : nota >= 9 && rand() < 0.25 ? 'Excelente desempeño' : null;

  const calificaciones: any[] = [];
  for (let i = 0; i < alumnos.length; i++) {
    const materiasCurso = cursoMaterias.get(cursos[alumnoCurso[i]].id)!;
    for (const { materiaId: mid } of materiasCurso) {
      for (const trimestre of [1, 2]) {
        const nota = notasPonderadas();
        calificaciones.push({
          alumnoId: alumnos[i].id,
          materiaId: mid,
          nota,
          trimestre,
          fecha: new Date(Date.UTC(2026, trimestre === 1 ? 3 : 6, randomInt(1, 28))),
          observacion: obsNota(nota),
        });
      }
      if (rand() < 0.4) {
        const nota = notasPonderadas();
        calificaciones.push({
          alumnoId: alumnos[i].id,
          materiaId: mid,
          nota,
          trimestre: 3,
          fecha: new Date(Date.UTC(2026, 9, randomInt(1, 28))),
          observacion: obsNota(nota),
        });
      }
    }
  }
  for (let i = 0; i < calificaciones.length; i += 1000) {
    await prisma.calificacion.createMany({ data: calificaciones.slice(i, i + 1000) });
  }
  console.log(`✅ Calificaciones: ${calificaciones.length} (T1+T2 completos, T3 parcial)`);

  // ── Módulos semanales (5 semanas de julio 2026) ──
  const semanas = [
    new Date(Date.UTC(2026, 6, 29)),
    new Date(Date.UTC(2026, 7, 6)),
    new Date(Date.UTC(2026, 7, 13)),
    new Date(Date.UTC(2026, 7, 20)),
    new Date(Date.UTC(2026, 7, 27)),
  ];
  const factores = ['ausencia', 'licencia', 'paro', 'asamblea', 'feriado'];
  const moduloRows: any[] = [];
  for (const curso of cursos) {
    for (const { materiaId: mid, modulosPorSemana } of cursoMaterias.get(curso.id)!) {
      const docenteId = moduloDocentes.get(`${curso.id}:${mid}`)!;
      for (const semanaInicio of semanas) {
        const previstos = modulosPorSemana;
        let dictados = previstos;
        let factor: string | null = null;
        let observacion: string | null = null;
        if (rand() < 0.15) {
          dictados = Math.max(0, previstos - randomInt(1, 3));
          factor = pick(factores);
          observacion = 'Módulos no dictados';
        }
        moduloRows.push({
          docenteId,
          cursoId: curso.id,
          materiaId: mid,
          semanaInicio,
          modulosPrevistos: previstos,
          modulosDictados: dictados,
          factor,
          observacion,
        });
      }
    }
  }
  for (let i = 0; i < moduloRows.length; i += 1000) {
    await prisma.moduloSemanal.createMany({ data: moduloRows.slice(i, i + 1000) });
  }
  console.log(`✅ Módulos semanales: ${moduloRows.length} (${cursos.length * 3} combos × ${semanas.length} semanas)`);

  // ── Licencias ──
  const licenciaRows = Array.from({ length: 8 }, (_, i) => {
    const docente = docentes[(i * 5 + 3) % 60];
    const inicio = randomInt(1, 15);
    return {
      docenteId: docente.id,
      fechaInicio: new Date(Date.UTC(2026, 6, inicio)),
      fechaFin: new Date(Date.UTC(2026, 6, Math.min(30, inicio + randomInt(2, 5)))),
      codigo: pick(['LIC-MED', 'LIC-PERSONAL', 'LIC-FAMILIAR', 'LIC-EXAMEN']),
      motivo: pick(['Licencia por enfermedad', 'Motivos personales', 'Licencia familiar', 'Rendir examen']),
      estado: i % 2 === 0 ? 'aprobada' : 'pendiente',
      observacion: i % 3 === 0 ? 'Se adjunta certificado médico' : null,
    };
  });
  await prisma.licencia.createMany({ data: licenciaRows });
  console.log(`✅ Licencias: ${licenciaRows.length}`);

  // ── Actas / Acuerdos / Seguimientos ──
  const alumnoActivos = alumnos.filter(a => a.estado === 'activo');
  const muestra = (n: number) => Array.from({ length: n }, () => alumnoActivos[randomInt(0, alumnoActivos.length - 1)]);

  const actas = muestra(25).map((al, i) => {
    const tipo = pick(['Compromiso', 'Reconocimiento', 'Sanción', 'Reunión']);
    return {
      alumnoId: al.id,
      tipo,
      descripcion: pick([
        'Acta de compromiso por bajo rendimiento académico',
        'Reconocimiento por mejora en calificaciones',
        'Acta por reiteradas inasistencias',
        'Reunión con tutores por situación conductual',
        'Acta de sanción por indisciplina en el aula',
      ]),
      numero: `ACT-${String(i + 1).padStart(3, '0')}-2026`,
      fecha: new Date(Date.UTC(2026, 6, randomInt(1, 30))),
    };
  });
  await prisma.acta.createMany({ data: actas });

  const acuerdos = muestra(30).map((al) => ({
    alumnoId: al.id,
    tipo: pick(['alumno', 'docente', 'familia']),
    descripcion: pick([
      'Acordó presentar trabajos prácticos atrasados',
      'Se comprometió a mejorar la conducta en clase',
      'Reunión con familia por inasistencias reiteradas',
      'Acuerdo de seguimiento académico trimestral',
      'Compromiso de puntualidad en la entrada',
    ]),
    estado: pick(['pendiente', 'cumplido', 'vencido']),
    fecha: new Date(Date.UTC(2026, 6, randomInt(1, 30))),
  }));
  await prisma.acuerdo.createMany({ data: acuerdos });

  const seguimientos = muestra(20).map((al) => ({
    alumnoId: al.id,
    tipo: pick(['academico', 'conductual']),
    titulo: pick([
      'Seguimiento trimestral',
      'Intervención conductual',
      'Apoyo escolar en Matemática',
      'Seguimiento de asistencia',
      'Orientación vocacional',
    ]),
    descripcion: pick([
      'Bajo rendimiento en Matemática. Se recomienda apoyo escolar.',
      'Interrupciones frecuentes en clase. Se derivó a preceptoría.',
      'Mejora sostenida en el segundo trimestre.',
      'Ausencias reiteradas los lunes.',
      'Se detectó interés por la orientación informática.',
    ]),
    estado: pick(['pendiente', 'en_seguimiento', 'resuelto']),
    fecha: new Date(Date.UTC(2026, 6, randomInt(1, 30))),
  }));
  await prisma.seguimiento.createMany({ data: seguimientos });
  console.log(`✅ Actas: ${actas.length} | Acuerdos: ${acuerdos.length} | Seguimientos: ${seguimientos.length}`);

  // ── Tutores (1-2 por alumno activo) ──
  const tutorRows: any[] = [];
  for (const al of alumnoActivos) {
    const cantidad = rand() < 0.7 ? 2 : 1;
    for (let j = 0; j < cantidad; j++) {
      tutorRows.push({
        alumnoId: al.id,
        nombre: pick(NOMBRES),
        apellido: pick(APELLIDOS),
        dni: String(15000000 + randomInt(0, 12000000)),
      });
    }
  }
  await prisma.tutor.createMany({ data: tutorRows });
  console.log(`✅ Tutores: ${tutorRows.length}`);

  console.log('\n🎉 Seed completado exitosamente');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 admin / admin123');
  console.log('🔑 preceptor / preceptor123');
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
