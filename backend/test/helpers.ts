import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Bootstrap de integración (lo que Nest llama "e2e" y la cátedra ubica como
 * integración de API): la app completa en memoria, con PostgreSQL real
 * (gestionada → real) y la guarda JWT real.
 *
 * Trampa de la cátedra: los globals de main.ts NO se aplican solos en el test.
 */
export async function crearApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export async function login(
  app: INestApplication,
  nombreUsuario: string,
  contrasena: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ nombreUsuario, contrasena })
    .expect(200);
  return res.body.accessToken;
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}
