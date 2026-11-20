import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, crearApp, login } from './helpers';

// Flujo crítico 1 — ciclo académico completo de un alumno nuevo:
// alta → inscripción → asistencia → calificación → dashboard → PDF.
// PostgreSQL real, guarda JWT real, rol rector (escritura + dashboard).
describe('Flujo crítico: alta e integración de un alumno (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let cursoId: number;
  let alumnoId: number;
  let inscripcionId: number;
  let materiaId: number;

  const ts = Date.now().toString().slice(-6);
  const dni = `4097${ts}`;

  beforeAll(async () => {
    app = await crearApp();
    token = await login(app, 'rector', 'rector123');
  });

  afterAll(async () => {
    await app.close();
  });

  function post(ruta: string, cuerpo: object) {
    return request(app.getHttpServer())
      .post(ruta)
      .set('Authorization', auth(token).Authorization)
      .send(cuerpo);
  }

  it('1. curso nuevo → 201', async () => {
    const res = await post('/api/cursos', {
      anio: 1,
      division: `Z${ts}`,
      turno: 'tarde',
      orientacion: 'Ciclo Básico',
      cicloLectivo: 2027,
    }).expect(201);
    cursoId = res.body.id;
    expect(cursoId).toBeGreaterThan(0);
  });

  it('2. alumno nuevo → 201', async () => {
    const res = await post('/api/alumnos', {
      dni,
      nombre: 'Flujo',
      apellido: `Academico${ts}`,
      nacimiento: '2008-05-01',
      direccion: 'Calle 1',
      telefono: '1155550000',
      fechaIngreso: '2026-03-01',
    }).expect(201);
    alumnoId = res.body.id;
    expect(alumnoId).toBeGreaterThan(0);
  });

  it('3. inscripción del alumno en el curso → 201', async () => {
    const res = await post('/api/inscripciones', {
      alumnoId,
      cursoId,
    }).expect(201);
    inscripcionId = res.body.id;
    expect(res.body).toMatchObject({ alumnoId, cursoId });
  });

  it('4. asistencia en día de clase (martes 2026-07-14) → 201; sin justificada el estado es ausente', async () => {
    const res = await post('/api/asistencias', {
      alumnoId,
      fecha: '2026-07-14',
    }).expect(201);
    expect(res.body.estado).toBe('ausente');
  });

  it('5. calificación en una materia DEL curso → 201', async () => {
    const carga = await request(app.getHttpServer())
      .get(`/api/cursos-materias/curso/${cursoId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    // El curso recién creado no tiene materias: asignamos una primero.
    if (carga.body.length === 0) {
      const materias = await request(app.getHttpServer())
        .get('/api/materias?page=1&limit=1')
        .set('Authorization', auth(token).Authorization)
        .expect(200);
      materiaId = materias.body.data[0].id;
      await post('/api/cursos-materias', {
        cursoId,
        materiaId,
        cargaHoraria: 2,
        modulosPorSemana: 2,
      }).expect(201);
    } else {
      materiaId = carga.body[0].materiaId;
    }

    const res = await post('/api/calificaciones', {
      alumnoId,
      materiaId,
      nota: 8,
      trimestre: 1,
    }).expect(201);
    expect(res.body).toMatchObject({ alumnoId, materiaId, nota: 8, trimestre: 1 });
  });

  it('6. dashboard resumen (rector) → 200 con datos', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/resumen')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    expect(res.body).toHaveProperty('asistenciaHoy');
  });

  it('7. PDF de calificaciones del alumno → 200 application/pdf', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/reportes/calificaciones/${alumnoId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    expect(String(res.headers['content-type'])).toContain('pdf');
  });

  it('8. cleanup: desinscripción + bajas del curso y el alumno', async () => {
    await request(app.getHttpServer())
      .delete(`/api/inscripciones/${alumnoId}/${cursoId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/cursos/${cursoId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/alumnos/${alumnoId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200)
      .expect((r) => expect(r.body.estado).toBe('inactivo'));
  });
});
