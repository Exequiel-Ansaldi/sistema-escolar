import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, crearApp, login } from './helpers';

// Integración de CONCURRENCIA con PostgreSQL real (Unidad V, clase 3):
// dos versiones "conviven" → la restricción única de la base es el árbitro
// final. N envíos paralelos del mismo recurso: exactamente 1 creado, el
// resto 409 (nunca 500). Requiere la base seedeada (admin/admin123).
describe('Concurrencia (integración)', () => {
  let app: INestApplication;
  let token: string;
  let cursoId: number;

  const dniAlumno = `4099${String(Date.now()).slice(-6)}`;
  const dniCarrera = `4098${String(Date.now()).slice(-6)}`;

  beforeAll(async () => {
    app = await crearApp();
    token = await login(app, 'admin', 'admin123');
    const cursos = await request(app.getHttpServer())
      .get('/api/cursos?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    cursoId = cursos.body.data[0].id;
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

  it('5 inscripciones PARALELAS del mismo (alumno, curso): 1 creada, resto 409 (no 500)', async () => {
    const alumno = await post('/api/alumnos', {
      dni: dniAlumno,
      nombre: 'Conc',
      apellido: `Current${Date.now().toString().slice(-4)}`,
      nacimiento: '2008-05-01',
      direccion: 'Calle 1',
      telefono: '1155550000',
      fechaIngreso: '2026-03-01',
    }).expect(201);

    const resultados = await Promise.all(
      Array.from({ length: 5 }, () =>
        post('/api/inscripciones', {
          alumnoId: alumno.body.id,
          cursoId,
        }),
      ),
    );

    const creadas = resultados.filter((r) => r.status === 201);
    const rechazadas = resultados.filter((r) => r.status === 409);
    const otros = resultados.filter(
      (r) => r.status !== 201 && r.status !== 409,
    );

    expect(creadas).toHaveLength(1);
    expect(rechazadas).toHaveLength(4);
    expect(otros).toEqual([]); // ningún 500: el race se resuelve con 409

    // Cleanup: desinscripción + baja física del alumno de prueba.
    await request(app.getHttpServer())
      .delete(`/api/inscripciones/${alumno.body.id}/${cursoId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/alumnos/${alumno.body.id}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
  });

  it('5 altas PARALELAS con el mismo DNI: 1 creada, resto 409 (no 500)', async () => {
    const cuerpo = {
      dni: dniCarrera,
      nombre: 'Dni',
      apellido: `Race${Date.now().toString().slice(-4)}`,
      nacimiento: '2008-05-01',
      direccion: 'Calle 2',
      telefono: '1155550001',
      fechaIngreso: '2026-03-01',
    };
    const resultados = await Promise.all(
      Array.from({ length: 5 }, () => post('/api/alumnos', cuerpo)),
    );

    const creadas = resultados.filter((r) => r.status === 201);
    const rechazadas = resultados.filter((r) => r.status === 409);
    const otros = resultados.filter(
      (r) => r.status !== 201 && r.status !== 409,
    );

    expect(creadas).toHaveLength(1);
    expect(rechazadas).toHaveLength(4);
    expect(otros).toEqual([]);

    const ganador = creadas[0];
    // Cleanup: el DELETE es soft (estado inactivo); el DNI queda ocupado pero
    // con sufijo temporal por corrida, así que no contamina re-ejecuciones.
    await request(app.getHttpServer())
      .delete(`/api/alumnos/${ganador.body.id}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
  });
});
