import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaginatedResult } from '../services/api';
import { api } from '../services/api';
import type { Alumno } from '../types';
import { useCrud } from './useCrud';

// Hook headless probado sin red: el módulo del service se reemplaza por un
// mock con vi.fn() por método; esos dobles se pasan como callbacks al hook.
vi.mock('../services/api', () => ({
  api: {
    getAlumnos: vi.fn(),
    createAlumno: vi.fn(),
    updateAlumno: vi.fn(),
    deleteAlumno: vi.fn(),
  },
}));

const getAlumnos = vi.mocked(api.getAlumnos);
const createAlumno = vi.mocked(api.createAlumno);
const updateAlumno = vi.mocked(api.updateAlumno);
const deleteAlumno = vi.mocked(api.deleteAlumno);

function alumno(id: number, nombre: string): Alumno {
  return {
    id,
    dni: '30111222',
    nombre,
    apellido: 'García',
    nacimiento: '2008-03-15',
    direccion: 'Calle Falsa 123',
    telefono: '3794000000',
    estado: 'activo',
    fechaIngreso: '2024-02-20',
  };
}

function paginado(data: Alumno[], total = data.length): PaginatedResult<Alumno> {
  return { data, total, page: 1, limit: 10, totalPages: 1 };
}

function hookAlumnos() {
  return renderHook(() =>
    useCrud(api.getAlumnos, api.createAlumno, api.updateAlumno, api.deleteAlumno),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCrud', () => {
  it('carga la lista al montar con página 1 y límite 10', async () => {
    const lista = [alumno(1, 'Ana')];
    getAlumnos.mockResolvedValue(paginado(lista, 12));

    const { result } = hookAlumnos();

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAlumnos).toHaveBeenCalledTimes(1);
    expect(getAlumnos.mock.calls[0]).toEqual([1, 10, {}]);
    expect(result.current.data).toEqual(lista);
    expect(result.current.total).toBe(12);
    expect(result.current.totalPages).toBe(1);
  });

  it('create guarda con el método de la api, cierra el form y recarga la lista', async () => {
    getAlumnos
      .mockResolvedValueOnce(paginado([alumno(1, 'Ana')]))
      .mockResolvedValueOnce(paginado([alumno(1, 'Ana'), alumno(2, 'Beto')], 2));
    createAlumno.mockResolvedValue(alumno(2, 'Beto'));

    const { result } = hookAlumnos();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.openCreate(); });
    expect(result.current.showForm).toBe(true);

    let creado: Alumno | undefined;
    await act(async () => { creado = await result.current.save({ nombre: 'Beto' }); });

    expect(creado).toEqual(alumno(2, 'Beto'));
    expect(createAlumno.mock.calls[0]).toEqual([{ nombre: 'Beto' }]);
    expect(result.current.showForm).toBe(false);
    // Recarga después del éxito: la segunda carga ya incluye el nuevo alumno.
    await waitFor(() => expect(getAlumnos).toHaveBeenCalledTimes(2));
    expect(result.current.data).toEqual([alumno(1, 'Ana'), alumno(2, 'Beto')]);
    // Orden: primero el create, después la recarga.
    expect(createAlumno.mock.invocationCallOrder[0]).toBeLessThan(getAlumnos.mock.invocationCallOrder[1]);
  });

  it('update guarda con el id de la fila en edición y recarga', async () => {
    getAlumnos
      .mockResolvedValueOnce(paginado([alumno(1, 'Ana')]))
      .mockResolvedValueOnce(paginado([alumno(1, 'Ana editada')]));
    updateAlumno.mockResolvedValue(alumno(1, 'Ana editada'));

    const { result } = hookAlumnos();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.openEdit(alumno(1, 'Ana')); });
    expect(result.current.editing).toEqual(alumno(1, 'Ana'));

    await act(async () => { await result.current.save({ nombre: 'Ana editada' }); });

    expect(updateAlumno).toHaveBeenCalledTimes(1);
    expect(updateAlumno.mock.calls[0]).toEqual([1, { nombre: 'Ana editada' }]);
    expect(createAlumno).not.toHaveBeenCalled();
    await waitFor(() => expect(getAlumnos).toHaveBeenCalledTimes(2));
    expect(result.current.data).toEqual([alumno(1, 'Ana editada')]);
  });

  it('delete confirma la fila, la elimina y recarga con mensaje de éxito', async () => {
    getAlumnos
      .mockResolvedValueOnce(paginado([alumno(1, 'Ana')]))
      .mockResolvedValueOnce(paginado([]));
    deleteAlumno.mockResolvedValue(undefined as unknown as Alumno);

    const { result } = hookAlumnos();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.confirmRemove(alumno(1, 'Ana')); });
    expect(result.current.pendingDelete).toEqual(alumno(1, 'Ana'));

    await act(async () => { await result.current.executeDelete(); });

    expect(deleteAlumno.mock.calls[0]).toEqual([1]);
    expect(result.current.deleteMessage).toEqual({ message: 'Eliminado con éxito', type: 'success' });
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.deleting).toBe(false);
    await waitFor(() => expect(getAlumnos).toHaveBeenCalledTimes(2));
  });

  it('expone el error del guardado sin cerrar el form ni recargar', async () => {
    getAlumnos.mockResolvedValue(paginado([alumno(1, 'Ana')]));
    createAlumno.mockRejectedValue(new Error('DNI duplicado'));

    const { result } = hookAlumnos();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.openCreate(); });
    expect(result.current.showForm).toBe(true);

    let guardado: Alumno | undefined;
    await act(async () => { guardado = await result.current.save({ nombre: 'Beto' }); });

    expect(guardado).toBeUndefined();
    expect(result.current.error).toBe('DNI duplicado');
    expect(result.current.showForm).toBe(true); // el error NO cierra el form
    expect(getAlumnos).toHaveBeenCalledTimes(1); // no recarga tras el fallo
  });

  it('expone el error de la eliminación sin recargar', async () => {
    getAlumnos.mockResolvedValue(paginado([alumno(1, 'Ana')]));
    deleteAlumno.mockRejectedValue(new Error('Tiene inscripciones activas'));

    const { result } = hookAlumnos();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.confirmRemove(alumno(1, 'Ana')); });
    await act(async () => { await result.current.executeDelete(); });

    expect(result.current.deleteMessage).toEqual({ message: 'Tiene inscripciones activas', type: 'error' });
    expect(result.current.pendingDelete).toEqual(alumno(1, 'Ana'));
    expect(result.current.deleting).toBe(false);
    expect(getAlumnos).toHaveBeenCalledTimes(1); // no recarga tras el fallo
  });

  // VERDAD del código: el hook NO captura el error de `load` (solo resetea
  // `loading` en el finally y conserva los datos ya cargados); el rechazo se
  // propaga al llamador, por eso se consume acá con .rejects.
  it('ante un error de load resetea loading y conserva los datos sin exponer error', async () => {
    getAlumnos.mockResolvedValueOnce(paginado([alumno(1, 'Ana')]));

    const { result } = hookAlumnos();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();

    getAlumnos.mockRejectedValueOnce(new Error('Red caída'));
    await act(async () => { await expect(result.current.load()).rejects.toThrow('Red caída'); });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([alumno(1, 'Ana')]);
  });
});
