import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, crearApp, login } from './helpers';

// Integración de TRANSACCIONES con PostgreSQL real (Unidad V, clase 3):
// la escritura multi-tabla debe ser todo-o-nada y la entrada inválida no
// puede dejar estado parcial. Requiere la base seedeada (admin/admin123).
describe('Transacciones (integración)', () => {
  let app: INestApplication;
  let token: string;

  const ts = Date.now().toString().slice(-6);

  beforeAll(async () => {
    app = await crearApp();
    token = await login(app, 'admin', 'admin123');
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/usuarios crea persona + cuenta en UNA transacción y queda legible', async () => {
    // El rolId real viene del seed vivo (las secuencias avanzan entre seeds).
    const existentes = await request(app.getHttpServer())
      .get('/api/usuarios?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const rolId = existentes.body.data[0].rolId;

    const res = await request(app.getHttpServer())
      .post('/api/usuarios')
      .set('Authorization', auth(token).Authorization)
      .send({
        nombreUsuario: `test_tx_${ts}`,
        contrasena: 'secreta123',
        nombre: 'Test',
        apellido: 'Transaccional',
        rolId,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      nombreUsuario: `test_tx_${ts}`,
      nombre: 'Test',
      apellido: 'Transaccional',
    });

    // La cuenta (con su persona) existe para el GET — la transacción cerró.
    const id = res.body.id;
    await request(app.getHttpServer())
      .get(`/api/usuarios/${id}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
  });

  it('POST /api/usuarios con nombreUsuario duplicado → 409 (constraint de la base, no 500)', async () => {
    const existentes = await request(app.getHttpServer())
      .get('/api/usuarios?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const rolId = existentes.body.data[0].rolId;

    const cuerpo = {
      nombreUsuario: `test_tx_${ts}`, // ya creado en el test anterior
      contrasena: 'secreta123',
      nombre: 'Duplicado',
      apellido: 'Usuario',
      rolId,
    };
    await request(app.getHttpServer())
      .post('/api/usuarios')
      .set('Authorization', auth(token).Authorization)
      .send(cuerpo)
      .expect(409);
  });

  it('upsert módulos-mensuales: entrada INVÁLIDA (suma no cierra) → 400 y CERO filas nuevas', async () => {
    // Datos del seed: primer curso/docente/materia listados.
    const cursos = await request(app.getHttpServer())
      .get('/api/cursos?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const docentes = await request(app.getHttpServer())
      .get('/api/docentes?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const materias = await request(app.getHttpServer())
      .get('/api/materias?page=1&limit=1')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const cursoId = cursos.body.data[0].id;
    const docenteId = docentes.body.data[0].id;
    const materiaId = materias.body.data[0].id;

    const base = {
      docenteId,
      cursoId,
      materiaId,
      mes: `2027-${String((Number(ts) % 12) + 1).padStart(2, '0')}`,
      modulosPrevistos: 20,
      modulosDictados: 10,
      noDictados: [{ factor: 'otro', cantidad: 10 }],
    };

    // Válido: upsert transaccional crea padre + hijos.
    await request(app.getHttpServer())
      .post('/api/modulos-mensuales')
      .set('Authorization', auth(token).Authorization)
      .send(base)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`esperaba 200/201, llego ${r.status}: ${JSON.stringify(r.body)}`);
        }
      });

    // Invalido: la invariante falla ANTES de la transacción → nada cambia.
    await request(app.getHttpServer())
      .post('/api/modulos-mensuales')
      .set('Authorization', auth(token).Authorization)
      .send({ ...base, modulosDictados: 5, noDictados: [{ factor: 'otro', cantidad: 10 }] })
      .expect(400);

    // Estado intacto: el upsert anterior sigue con sus valores originales.
    // (anio/division/turno filtran el CURSO, no el ciclo lectivo: solo mes.)
    const lista = await request(app.getHttpServer())
      .get(`/api/modulos-mensuales?mes=${base.mes}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const registro = lista.body.data.find(
      (m: { cursoId: number; materiaId: number; docenteId: number }) =>
        m.cursoId === cursoId && m.materiaId === materiaId && m.docenteId === docenteId,
    );
    expect(registro).toBeDefined();
    expect(registro.modulosDictados).toBe(10);
    expect(registro.noDictados).toEqual(
      expect.arrayContaining([expect.objectContaining({ factor: 'otro', cantidad: 10 })]),
    );
  });

  it('asignación masiva cursos-materias: transacción idempotente (repetir → asignados 0, omitidos todos)', async () => {
    const grupos = await request(app.getHttpServer())
      .get('/api/cursos-materias/grupos')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    expect(grupos.body.data).toBeInstanceOf(Array);
    expect(grupos.body.data.length).toBeGreaterThan(0);

    // Grupo (curso) y una materia que ese curso NO tenga asignada.
    const grupo = grupos.body.data[0];
    const idsAsignadas: number[] = grupo.materias.map(
      (m: { materiaId: number }) => m.materiaId,
    );

    const todas = await request(app.getHttpServer())
      .get('/api/materias?page=1&limit=50')
      .set('Authorization', auth(token).Authorization)
      .expect(200);
    const libre = todas.body.data.find(
      (m: { id: number }) => !idsAsignadas.includes(m.id),
    );
    expect(libre).toBeDefined(); // el seed deja alguna combinación libre

    const primera = await request(app.getHttpServer())
      .post('/api/cursos-materias/masivo')
      .set('Authorization', auth(token).Authorization)
      .send({ cursoIds: [grupo.id], materiaId: libre.id, modulosPorSemana: 2 })
      .expect(201);
    expect(primera.body).toMatchObject({ asignados: 1, omitidos: 0, total: 1 });

    // Repetir la MISMA carga: la transacción filtra lo ya asignado.
    const segunda = await request(app.getHttpServer())
      .post('/api/cursos-materias/masivo')
      .set('Authorization', auth(token).Authorization)
      .send({ cursoIds: [grupo.id], materiaId: libre.id, modulosPorSemana: 2 })
      .expect(201);
    expect(segunda.body).toMatchObject({ asignados: 0, omitidos: 1, total: 1 });

    // Cleanup: dejamos el curso como estaba.
    await request(app.getHttpServer())
      .delete(`/api/cursos-materias/${grupo.id}/${libre.id}`)
      .set('Authorization', auth(token).Authorization)
      .expect(200);
  });

  it('validación de entrada: campo no permitido → 400 (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/api/materias')
      .set('Authorization', auth(token).Authorization)
      .send({ nombre: `test_v_${ts}`, campoInventado: 'x' })
      .expect(400);
  });
});
