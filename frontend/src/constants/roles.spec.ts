import { describe, expect, it } from 'vitest';
import { ROLES, puedeAcceder, puedeEscribir, rutaInicial } from './roles';

/*
 * INCONSISTENCIAS detectadas entre RUTAS_POR_ROL y ESCRITURA_POR_PATH
 * (documentadas acá; NO se corrigen, los tests fijan la VERDAD del código):
 *
 * 1) rutaInicial('preceptor_manana') devuelve '/cursos', no '/asistencias'
 *    como decía el spec S3: el loop usa el orden de inserción de
 *    RUTAS_POR_ROL y '/cursos' ([vicerrector, preceptor_manana]) aparece
 *    antes que '/asistencias'.
 * 2) Rutas SIN entrada en RUTAS_POR_ROL (p. ej. '/dashboard') son accesibles
 *    para CUALQUIER rol autenticado (puedeAcceder => true), aunque el backend
 *    restringe el dashboard a rector + vicerrector. La lista del front quedó
 *    corta respecto de los guards.
 * 3) '/' es accesible para vicerrector pero NO tiene entrada en
 *    ESCRITURA_POR_PATH => puedeEscribir(vicerrector, '/') === false.
 *    Coherente en la práctica (el dashboard es solo lectura), pero la regla
 *    "accesible => escribible" no se sostiene para ese path.
 */

describe('puedeAcceder', () => {
  it.each([
    [ROLES.ADMIN, '/alumnos'],
    [ROLES.ADMIN, '/dashboard'],
    [ROLES.RECTOR, '/alumnos'],
    [ROLES.RECTOR, '/asistencias'],
  ])('%s puede acceder siempre a %s (con o sin entrada en el mapa)', (rol, ruta) => {
    expect(puedeAcceder(rol, ruta)).toBe(true);
  });

  it('permite el acceso a un rol incluido en la entrada de la ruta', () => {
    expect(puedeAcceder(ROLES.SECRETARIA_ALUMNADO, '/alumnos')).toBe(true);
  });

  it('rechaza un rol excluido de la entrada de la ruta', () => {
    expect(puedeAcceder(ROLES.PRECEPTOR_MANANA, '/alumnos')).toBe(false);
  });

  it.each([
    [ROLES.VICERRECTOR, '/dashboard'],
    [ROLES.PRECEPTOR_MANANA, '/dashboard'],
  ])('permite %s en %s porque la ruta no tiene entrada en el mapa (inconsistencia 2)', (rol, ruta) => {
    expect(puedeAcceder(rol, ruta)).toBe(true);
  });

  it('rechaza cuando no hay rol', () => {
    expect(puedeAcceder(undefined, '/alumnos')).toBe(false);
    expect(puedeAcceder(undefined, '/dashboard')).toBe(false);
  });
});

describe('puedeEscribir', () => {
  it.each([
    [ROLES.ADMIN, '/dashboard'],
    [ROLES.RECTOR, '/alumnos'],
  ])('%s puede escribir en %s siempre', (rol, ruta) => {
    expect(puedeEscribir(rol, ruta)).toBe(true);
  });

  it('asesoria_pedagogica es SOLO LECTURA en /alumnos (regla del commit a50b44d)', () => {
    expect(puedeEscribir(ROLES.ASESORIA_PEDAGOGICA, '/alumnos')).toBe(false);
  });

  it('secretaria_alumnado puede escribir en /alumnos', () => {
    expect(puedeEscribir(ROLES.SECRETARIA_ALUMNADO, '/alumnos')).toBe(true);
  });

  it('rechaza escritura en una ruta sin entrada en ESCRITURA (vicerrector en /, inconsistencia 3)', () => {
    expect(puedeEscribir(ROLES.VICERRECTOR, '/')).toBe(false);
  });

  it('rechaza cuando no hay rol', () => {
    expect(puedeEscribir(undefined, '/alumnos')).toBe(false);
  });
});

describe('rutaInicial', () => {
  it('vicerrector aterriza en / (tiene acceso al dashboard)', () => {
    expect(rutaInicial(ROLES.VICERRECTOR)).toBe('/');
  });

  it('preceptor_manana aterriza en la primera ruta permitida: /cursos (inconsistencia 1)', () => {
    expect(rutaInicial(ROLES.PRECEPTOR_MANANA)).toBe('/cursos');
  });

  it('secretaria_alumnado aterriza en la primera ruta permitida: /alumnos', () => {
    expect(rutaInicial(ROLES.SECRETARIA_ALUMNADO)).toBe('/alumnos');
  });

  it('sin rol aterriza en /', () => {
    expect(rutaInicial(undefined)).toBe('/');
  });
});
