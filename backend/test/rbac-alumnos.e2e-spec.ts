import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, crearApp, login } from './helpers';

// Integración de RBAC sobre alumnos: lectura para asesoría (regla de
// 2026-11-20), escritura bloqueada para roles sin permiso, escritura real
// para rector. Requiere Postgres local arriba y la base seedeada.
describe('RBAC alumnos (integración)', () => {
  let app: INestApplication;
  let admin: string;
  let rector: string;
  let asesoria: string;

  beforeAll(async () => {
    app = await crearApp();
    admin = await login(app, 'admin', 'admin123');
    rector = await login(app, 'rector', 'rector123');
    asesoria = await login(
      app,
      'asesoria_pedagogica',
      'asesoria_pedagogica123',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/alumnos sin token → 401', async () => {
    await request(app.getHttpServer()).get('/api/alumnos').expect(401);
  });

  it('GET /api/alumnos como admin → 200', async () => {
    await request(app.getHttpServer())
      .get('/api/alumnos')
      .set('Authorization', auth(admin).Authorization)
      .expect(200);
  });

  it('GET /api/alumnos como asesoria_pedagogica → 200 (lectura para el expediente)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/alumnos')
      .set('Authorization', auth(asesoria).Authorization)
      .expect(200);
    expect(res.body).toMatchObject({ total: expect.any(Number) });
  });

  it('POST /api/alumnos como asesoria_pedagogica → 403 (solo lectura)', async () => {
    await request(app.getHttpServer())
      .post('/api/alumnos')
      .set('Authorization', auth(asesoria).Authorization)
      .send({
        dni: '89999999',
        nombre: 'X',
        apellido: 'Y',
        nacimiento: '2008-01-01',
        direccion: 'a',
        telefono: '1',
        fechaIngreso: '2026-03-01',
      })
      .expect(403);
  });

  it('POST /api/alumnos como rector → 201, y DELETE lo da de baja', async () => {
    const dni = `4099${String(Date.now()).slice(-6)}`;
    const creado = await request(app.getHttpServer())
      .post('/api/alumnos')
      .set('Authorization', auth(rector).Authorization)
      .send({
        dni,
        nombre: 'Test',
        apellido: 'E2e',
        nacimiento: '2008-01-01',
        direccion: 'Calle 1',
        telefono: '1155555555',
        fechaIngreso: '2026-03-01',
      })
      .expect(201);
    expect(creado.body).toMatchObject({ dni, nombre: 'Test' });

    await request(app.getHttpServer())
      .delete(`/api/alumnos/${creado.body.id}`)
      .set('Authorization', auth(rector).Authorization)
      .expect(200)
      .expect((res) => expect(res.body.estado).toBe('inactivo'));
  });
});
