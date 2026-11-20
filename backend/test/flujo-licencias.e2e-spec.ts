import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, crearApp, login } from './helpers';

// Flujo crítico 2 — ciclo de vida de una licencia docente con la máquina de
// estados (State de la Unidad III): crear → aprobar → finalizar, la
// transición inválida rechazada, y limpieza. PostgreSQL real, rol rector.
describe('Flujo crítico: licencia docente de punta a punta (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let docenteId: number;
  let licenciaId: number;

  beforeAll(async () => {
    app = await crearApp();
    token = await login(app, 'rector', 'rector123');
    const docentes = await request(app.getHttpServer())
      .get('/api/docentes?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    docenteId = docentes.body.data[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  function put(id: number, cuerpo: object) {
    return request(app.getHttpServer())
      .put(`/api/licencias/${id}`)
      .set('Authorization', auth(token).Authorization)
      .send(cuerpo);
  }

  it('1. crear licencia futura → 201 con estado inicial pendiente', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/licencias')
      .set('Authorization', auth(token).Authorization)
      .send({
        docenteId,
        fechaInicio: '2026-12-01',
        fechaFin: '2026-12-10',
        codigo: 'LIC-E2E',
        motivo: 'Licencia por enfermedad',
      })
      .expect(201);
    licenciaId = res.body.id;
    expect(res.body.estado).toBe('pendiente');
  });

  it('1b. rango inválido (fin antes del inicio) → 400 y nada creado', async () => {
    await request(app.getHttpServer())
      .post('/api/licencias')
      .set('Authorization', auth(token).Authorization)
      .send({
        docenteId,
        fechaInicio: '2026-12-10',
        fechaFin: '2026-12-01',
        codigo: 'LIC-E2E',
        motivo: 'Licencia por enfermedad',
      })
      .expect(400);
  });

  it('2. pendiente → aprobada → 200', async () => {
    const res = await put(licenciaId, { estado: 'aprobada' }).expect(200);
    expect(res.body.estado).toBe('aprobada');
  });

  it('3. aprobada → finalizada → 200 (y en la lista queda finalizada)', async () => {
    const res = await put(licenciaId, { estado: 'finalizada' }).expect(200);
    expect(res.body.estado).toBe('finalizada');

    const lista = await request(app.getHttpServer())
      .get(`/api/licencias/docente/${docenteId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const licencia = lista.body.data.find(
      (l: { id: number }) => l.id === licenciaId,
    );
    expect(licencia).toBeDefined();
    expect(licencia.estado).toBe('finalizada');
  });

  it('4. finalizada → aprobada (terminal) → 400', async () => {
    await put(licenciaId, { estado: 'aprobada' }).expect(400);
  });

  it('5. cleanup: DELETE de la licencia de prueba → 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/licencias/${licenciaId}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
  });
});
