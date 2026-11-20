import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, crearApp, login } from './helpers';

// Integración de autenticación: guarda JWT real, PostgreSQL real.
// Requiere Postgres local arriba y la base seedeada (admin/admin123).
describe('Autenticación (integración)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await crearApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login con credenciales válidas → 200 + accessToken + persona', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ nombreUsuario: 'admin', contrasena: 'admin123' })
      .expect(200);
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.usuario).toMatchObject({
      nombreUsuario: 'admin',
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'admin',
    });
  });

  it('POST /api/auth/login con contraseña corta → 400 (validación de DTO antes de auth)', async () => {
    // LoginDto exige MinLength(6): el rechazo es del ValidationPipe, no del auth.
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ nombreUsuario: 'admin', contrasena: 'mal' })
      .expect(400);
  });

  it('POST /api/auth/login con contraseña inválida pero válida en forma → 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ nombreUsuario: 'admin', contrasena: 'incorrecta123' })
      .expect(401);
  });

  it('POST /api/auth/login con usuario inexistente → 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ nombreUsuario: 'nadie', contrasena: 'correcta123' })
      .expect(401);
  });

  it('GET protegido sin token → 401', async () => {
    await request(app.getHttpServer()).get('/api/alumnos').expect(401);
  });

  it('GET protegido con token válido → 200', async () => {
    const token = await login(app, 'admin', 'admin123');
    await request(app.getHttpServer())
      .get('/api/alumnos')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
  });
});
