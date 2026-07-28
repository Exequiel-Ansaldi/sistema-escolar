import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...\n');

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
  await prisma.curso.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();

  // ── Roles ──
  const adminRol = await prisma.rol.create({ data: { nombreRol: 'admin' } });
  const preceptorRol = await prisma.rol.create({ data: { nombreRol: 'preceptor' } });
  console.log('✅ Roles: admin, preceptor');

  // ── Usuarios ──
  const hash = await bcrypt.hash('admin123', 10);
  const hashPre = await bcrypt.hash('preceptor123', 10);
  await prisma.usuario.create({ data: { nombreUsuario: 'admin', contrasena: hash, nombre: 'Admin', apellido: 'Sistema', rolId: adminRol.id } });
  await prisma.usuario.create({ data: { nombreUsuario: 'preceptor', contrasena: hashPre, nombre: 'Carlos', apellido: 'López', rolId: preceptorRol.id } });
  console.log('✅ Usuarios: admin (admin:admin123), preceptor (preceptor:preceptor123)');

  // ── Alumnos ──
  const alumnos = await Promise.all([
    prisma.alumno.create({ data: { dni: '40123456', nombre: 'Lautaro', apellido: 'Giménez', nacimiento: new Date('2008-03-15'), direccion: 'Av. Siempre Viva 123', telefono: '1123456789', fechaIngreso: new Date('2024-03-01') } }),
    prisma.alumno.create({ data: { dni: '40234567', nombre: 'Mía', apellido: 'Rodríguez', nacimiento: new Date('2007-07-22'), direccion: 'Calle Falsa 456', telefono: '1123456790', fechaIngreso: new Date('2024-03-01') } }),
    prisma.alumno.create({ data: { dni: '40345678', nombre: 'Tomás', apellido: 'Martínez', nacimiento: new Date('2008-11-02'), direccion: 'Belgrano 789', telefono: '1123456791', fechaIngreso: new Date('2024-03-01') } }),
    prisma.alumno.create({ data: { dni: '40456789', nombre: 'Sofía', apellido: 'Fernández', nacimiento: new Date('2006-05-18'), direccion: 'San Martín 321', telefono: '1123456792', fechaIngreso: new Date('2023-03-01') } }),
    prisma.alumno.create({ data: { dni: '40567890', nombre: 'Benjamín', apellido: 'Pereyra', nacimiento: new Date('2007-09-30'), direccion: 'Rivadavia 654', telefono: '1123456793', fechaIngreso: new Date('2024-03-01') } }),
    prisma.alumno.create({ data: { dni: '40678901', nombre: 'Valentina', apellido: 'Acosta', nacimiento: new Date('2006-01-10'), direccion: 'Mitre 987', telefono: '1123456794', fechaIngreso: new Date('2023-03-01') } }),
  ]);
  console.log(`✅ Alumnos: ${alumnos.length} creados`);

  // ── Cursos ──
  const cursos = await Promise.all([
    prisma.curso.create({ data: { anio: 1, division: 'A', turno: 'mañana', orientacion: 'Ciclo Básico', cicloLectivo: 2026 } }),
    prisma.curso.create({ data: { anio: 2, division: 'B', turno: 'tarde', orientacion: 'Ciclo Básico', cicloLectivo: 2026 } }),
    prisma.curso.create({ data: { anio: 3, division: 'A', turno: 'mañana', orientacion: 'Ciencias Naturales', cicloLectivo: 2026 } }),
  ]);
  console.log(`✅ Cursos: ${cursos.length} creados`);

  // ── Docentes ──
  const docentes = await Promise.all([
    prisma.docente.create({ data: { dni: '20123456', nombre: 'María', apellido: 'González', telefono: '1145678901', email: 'maria.gonzalez@escuela.edu', fechaIngreso: new Date('2020-03-01') } }),
    prisma.docente.create({ data: { dni: '21234567', nombre: 'José', apellido: 'Ramírez', telefono: '1145678902', email: 'jose.ramirez@escuela.edu', fechaIngreso: new Date('2019-03-01') } }),
    prisma.docente.create({ data: { dni: '22345678', nombre: 'Laura', apellido: 'Díaz', telefono: '1145678903', email: 'laura.diaz@escuela.edu', fechaIngreso: new Date('2021-03-01') } }),
  ]);
  console.log(`✅ Docentes: ${docentes.length} creados`);

  // ── Materias ──
  const materias = await Promise.all([
    prisma.materia.create({ data: { nombre: 'Matemática' } }),
    prisma.materia.create({ data: { nombre: 'Lengua' } }),
    prisma.materia.create({ data: { nombre: 'Historia' } }),
    prisma.materia.create({ data: { nombre: 'Inglés' } }),
  ]);
  console.log(`✅ Materias: ${materias.length} creadas`);

  // ── CursoMateria (carga horaria por curso) ──
  await prisma.cursoMateria.createMany({ data: [
    { cursoId: cursos[0].id, materiaId: materias[0].id, cargaHoraria: 5, modulosPorSemana: 8 },
    { cursoId: cursos[0].id, materiaId: materias[1].id, cargaHoraria: 4, modulosPorSemana: 6 },
    { cursoId: cursos[0].id, materiaId: materias[3].id, cargaHoraria: 3, modulosPorSemana: 5 },
    { cursoId: cursos[1].id, materiaId: materias[0].id, cargaHoraria: 4, modulosPorSemana: 6 },
    { cursoId: cursos[1].id, materiaId: materias[1].id, cargaHoraria: 4, modulosPorSemana: 6 },
    { cursoId: cursos[1].id, materiaId: materias[2].id, cargaHoraria: 3, modulosPorSemana: 5 },
    { cursoId: cursos[2].id, materiaId: materias[0].id, cargaHoraria: 5, modulosPorSemana: 8 },
    { cursoId: cursos[2].id, materiaId: materias[2].id, cargaHoraria: 4, modulosPorSemana: 6 },
    { cursoId: cursos[2].id, materiaId: materias[3].id, cargaHoraria: 3, modulosPorSemana: 5 },
  ]});
  console.log('✅ CursoMateria: 9 asignaciones con carga horaria y módulos');

  // ── DocenteMateria ──
  await prisma.docenteMateria.createMany({ data: [
    { docenteId: docentes[0].id, materiaId: materias[0].id },
    { docenteId: docentes[0].id, materiaId: materias[1].id },
    { docenteId: docentes[1].id, materiaId: materias[2].id },
    { docenteId: docentes[2].id, materiaId: materias[3].id },
  ]});
  console.log('✅ DocenteMateria: 4 asignaciones');

  // ── Inscripciones ──
  await prisma.inscripcion.createMany({ data: [
    { alumnoId: alumnos[0].id, cursoId: cursos[0].id },
    { alumnoId: alumnos[1].id, cursoId: cursos[0].id },
    { alumnoId: alumnos[2].id, cursoId: cursos[1].id },
    { alumnoId: alumnos[3].id, cursoId: cursos[2].id },
    { alumnoId: alumnos[4].id, cursoId: cursos[1].id },
    { alumnoId: alumnos[5].id, cursoId: cursos[2].id },
  ]});
  console.log('✅ Inscripciones: 6 creadas');

  // ── Asistencias (solo inasistencias) ──
  await prisma.asistencia.createMany({ data: [
    { alumnoId: alumnos[0].id, fecha: new Date('2026-07-20'), estado: 'ausente' },
    { alumnoId: alumnos[1].id, fecha: new Date('2026-07-20'), estado: 'justificado', justificacion: 'Médica' },
    { alumnoId: alumnos[3].id, fecha: new Date('2026-07-21'), estado: 'ausente' },
    { alumnoId: alumnos[4].id, fecha: new Date('2026-07-21'), estado: 'justificado', justificacion: 'Familiar' },
    { alumnoId: alumnos[5].id, fecha: new Date('2026-07-22'), estado: 'ausente', observacion: 'Llegó tarde y no ingresó' },
  ]});
  console.log('✅ Asistencias: 5 inasistencias registradas');

  // ── Calificaciones ──
  await prisma.calificacion.createMany({ data: [
    { alumnoId: alumnos[0].id, materiaId: materias[0].id, nota: 8, trimestre: 1, observacion: 'Buen desempeño' },
    { alumnoId: alumnos[0].id, materiaId: materias[1].id, nota: 7, trimestre: 1 },
    { alumnoId: alumnos[0].id, materiaId: materias[0].id, nota: 9, trimestre: 2 },
    { alumnoId: alumnos[1].id, materiaId: materias[0].id, nota: 6, trimestre: 1 },
    { alumnoId: alumnos[1].id, materiaId: materias[1].id, nota: 8, trimestre: 1 },
    { alumnoId: alumnos[3].id, materiaId: materias[0].id, nota: 5, trimestre: 1, observacion: 'Necesita mejorar' },
    { alumnoId: alumnos[3].id, materiaId: materias[2].id, nota: 7, trimestre: 1 },
    { alumnoId: alumnos[4].id, materiaId: materias[0].id, nota: 10, trimestre: 1, observacion: 'Excelente' },
  ]});
  console.log('✅ Calificaciones: 8 creadas');

  // ── Actas ──
  await prisma.acta.createMany({ data: [
    { alumnoId: alumnos[3].id, tipo: 'Compromiso', descripcion: 'Acta de compromiso por bajo rendimiento académico', numero: 'ACT-001-2026' },
    { alumnoId: alumnos[0].id, tipo: 'Reconocimiento', descripcion: 'Reconocimiento por mejora en calificaciones', numero: 'ACT-002-2026' },
  ]});
  console.log('✅ Actas: 2 creadas');

  // ── Acuerdos (con tipo) ──
  await prisma.acuerdo.createMany({ data: [
    { alumnoId: alumnos[3].id, tipo: 'docente', descripcion: 'Acordó presentar trabajos prácticos atrasados', estado: 'pendiente' },
    { alumnoId: alumnos[0].id, tipo: 'alumno', descripcion: 'Se comprometió a mejorar la conductura en clase', estado: 'cumplido' },
    { alumnoId: alumnos[1].id, tipo: 'familia', descripcion: 'Reunión con padres por inasistencias reiteradas', estado: 'pendiente' },
  ]});
  console.log('✅ Acuerdos: 3 creados (docente, alumno, familia)');

  // ── Seguimientos ──
  await prisma.seguimiento.createMany({ data: [
    { alumnoId: alumnos[3].id, tipo: 'academico', titulo: 'Seguimiento trimestral', descripcion: 'Bajo rendimiento en Matemática. Se recomienda apoyo escolar.', estado: 'pendiente' },
    { alumnoId: alumnos[0].id, tipo: 'conductual', titulo: 'Intervención conductual', descripcion: 'Interrupciones frecuentes en clase. Se derivó a preceptoría.', estado: 'pendiente' },
  ]});
  console.log('✅ Seguimientos: 2 creados');

  // ── Tutores ──
  await prisma.tutor.createMany({ data: [
    { alumnoId: alumnos[0].id, nombre: 'Roberto', apellido: 'Giménez', dni: '18234567' },
    { alumnoId: alumnos[0].id, nombre: 'Analía', apellido: 'Giménez', dni: '27345678' },
    { alumnoId: alumnos[3].id, nombre: 'Marcelo', apellido: 'Fernández', dni: '16345678' },
  ]});
  console.log('✅ Tutores: 3 creados');

  // ── Licencias (sin codigo explícito, usa default LIC-OTRO) ──
  await prisma.licencia.createMany({ data: [
    { docenteId: docentes[0].id, fechaInicio: new Date('2026-07-15'), fechaFin: new Date('2026-07-17'), motivo: 'Licencia por enfermedad', estado: 'aprobada' },
    { docenteId: docentes[1].id, fechaInicio: new Date('2026-07-22'), fechaFin: new Date('2026-07-26'), motivo: 'Viaje personal', estado: 'pendiente' },
  ]});
  console.log('✅ Licencias: 2 creadas');

  // ── Módulos Semanales ──
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  const factores = ['ausencia', 'licencia', 'paro', 'asamblea', 'feriado', null] as const;
  await prisma.moduloSemanal.createMany({ data: Array.from({ length: 10 }, (_, i) => {
    const cm = [
      { cursoId: cursos[0].id, materiaId: materias[0].id },
      { cursoId: cursos[0].id, materiaId: materias[1].id },
      { cursoId: cursos[1].id, materiaId: materias[0].id },
      { cursoId: cursos[2].id, materiaId: materias[2].id },
    ][i % 4];
    const fecha = new Date(2026, 6, 6 + i * 7);
    const semanaInicio = getMonday(fecha);
    const previstos = Math.floor(Math.random() * 4) + 3;
    const dictados = Math.random() > 0.2 ? previstos : previstos - Math.floor(Math.random() * 3) - 1;
    return {
      docenteId: docentes[i % 3].id,
      cursoId: cm.cursoId,
      materiaId: cm.materiaId,
      semanaInicio,
      modulosPrevistos: previstos,
      modulosDictados: Math.max(0, dictados),
      factor: dictados < previstos ? factores[Math.floor(Math.random() * 5)] : null,
      observacion: dictados < previstos ? 'Módulos no dictados' : null,
    };
  })});
  console.log('✅ Módulos Semanales: 10 registros creados');

  console.log('\n🎉 Seed completado exitosamente');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 admin / admin123');
  console.log('🔑 preceptor / preceptor123');
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
