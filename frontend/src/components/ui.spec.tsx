import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Badge, Button, ConfirmModal, DataTable, Input } from './ui';
import type { Alumno } from '../types';

// T3 (spec S3) — Componentes presentacionales: props + eventos, sin servicio.
// Datos tipados de ejemplo (sin any).
const alumnos: Alumno[] = [
  { id: 1, dni: '40111222', nombre: 'Ana', apellido: 'García', nacimiento: '2008-03-12', direccion: 'Calle 1', telefono: '3434567890', estado: 'activo', fechaIngreso: '2023-02-20' },
  { id: 2, dni: '42222333', nombre: 'Bruno', apellido: 'Díaz', nacimiento: '2007-07-01', direccion: 'Calle 2', telefono: '3434567891', estado: 'activo', fechaIngreso: '2023-02-20' },
  { id: 3, dni: '44333444', nombre: 'Carla', apellido: 'Pérez', nacimiento: '2009-11-30', direccion: 'Calle 3', telefono: '3434567892', estado: 'activo', fechaIngreso: '2024-02-20' },
];

const columnasAlumnos = [
  { key: 'dni', label: 'DNI' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
];

describe('DataTable (presentacional)', () => {
  it('renderiza los encabezados y las filas con los datos', () => {
    render(<DataTable columns={columnasAlumnos} data={alumnos} />);

    expect(screen.getByRole('columnheader', { name: 'DNI' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Apellido' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '40111222' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Bruno' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Pérez' })).toBeInTheDocument();
    // 1 fila de encabezado + 3 filas de datos
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('los botones editar/eliminar de cada fila invocan los callbacks con la fila correcta', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<DataTable columns={columnasAlumnos} data={alumnos} onEdit={onEdit} onDelete={onDelete} />);

    // Botón "Editar" de la 2ª fila (alumnos[1])
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[1]);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(alumnos[1]);

    // Botón "Eliminar" de la 3ª fila (alumnos[2])
    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[2]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(alumnos[2]);

    // Editar no fue invocado de nuevo por el click en Eliminar
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado vacío cuando no hay datos', () => {
    render(<DataTable columns={columnasAlumnos} data={[]} />);

    expect(screen.getByText('No hay datos')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('muestra el estado de carga mientras loading es verdadero', () => {
    render(<DataTable columns={columnasAlumnos} data={[]} loading />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });
});

describe('Badge (presentacional)', () => {
  it('aplica una clase distinta por variante', () => {
    render(
      <>
        <Badge variant="success">Activo</Badge>
        <Badge variant="danger">Ausente</Badge>
        <Badge variant="warning">Tardanza</Badge>
        <Badge variant="default">Neutro</Badge>
        <Badge>Sin variante</Badge>
      </>,
    );

    const claseDe = (texto: string) => screen.getByText(texto).className;
    expect(claseDe('Activo')).toContain('emerald');
    expect(claseDe('Ausente')).toContain('red');
    expect(claseDe('Tardanza')).toContain('amber');
    expect(claseDe('Neutro')).toContain('gray');
    // Sin variante explícita usa "default"
    expect(claseDe('Sin variante')).toContain('gray');
  });
});

describe('ConfirmModal (presentacional)', () => {
  const base = {
    title: 'Eliminar alumno',
    message: '¿Seguro que desea eliminar este alumno?',
  };

  it('abierto: muestra título, mensaje y los botones confirmar/cancelar', () => {
    render(<ConfirmModal {...base} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Eliminar alumno')).toBeInTheDocument();
    expect(screen.getByText(base.message)).toBeInTheDocument();
    // El botón de confirmación se llama "Eliminar" en el código real
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('click en el botón de confirmación invoca onConfirm y no onCancel', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmModal {...base} onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('click en cancelar invoca onCancel y no onConfirm', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmModal {...base} onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('con loading ambos botones quedan deshabilitados', () => {
    render(<ConfirmModal {...base} onConfirm={vi.fn()} onCancel={vi.fn()} loading />);

    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  // El componente no tiene prop "open": quien decide si se renderiza es el
  // contenedor con render condicional. Este test documenta ese patrón real.
  it('cerrado: el contenedor deja de renderizarlo (patrón de render condicional)', async () => {
    const user = userEvent.setup();
    function Contenedor() {
      const [abierto, setAbierto] = useState(true);
      if (!abierto) return <p>No hay modal</p>;
      return (
        <ConfirmModal
          {...base}
          onConfirm={vi.fn()}
          onCancel={() => setAbierto(false)}
        />
      );
    }
    render(<Contenedor />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByText('No hay modal')).toBeInTheDocument();
    expect(screen.queryByText('Eliminar alumno')).toBeNull();
  });
});

describe('Input (presentacional)', () => {
  it('muestra la label junto al campo', () => {
    render(<Input label="Correo" placeholder="tuc@ejemplo.com" />);

    expect(screen.getByText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tuc@ejemplo.com')).toBeInTheDocument();
  });

  // HALLAZGO de accesibilidad (cátedra: labels asociadas): el <label> no lleva
  // htmlFor y el <input> no tiene id, así que getByLabelText NO encuentra el
  // campo. Este spec documenta el comportamiento real de ui.tsx; arreglarlo
  // sería modificar código fuente fuera del alcance de este batch de specs.
  it('label asociada al input con htmlFor/id (cátedra: getByLabelText funciona)', () => {
    render(<Input label="Correo" placeholder="tuc@ejemplo.com" />);

    const campo = screen.getByLabelText('Correo');
    expect(campo).toHaveAttribute('placeholder', 'tuc@ejemplo.com');
  });

  // Contrato de la cátedra (Login.md §6.1): onChange entrega el VALOR y no el
  // evento del DOM, así el componente no depende del DOM.
  it('onChange entrega el VALOR directo, no el evento', async () => {
    const user = userEvent.setup();
    const recibidos: string[] = [];
    function CampoControlado() {
      const [valor, setValor] = useState('');
      return (
        <Input
          label="Nombre"
          value={valor}
          onChange={(v) => { recibidos.push(v); setValor(v); }}
        />
      );
    }
    render(<CampoControlado />);

    const campo = screen.getByRole('textbox');
    await user.type(campo, 'Ana');

    expect(recibidos.at(-1)).toBe('Ana');
    expect(campo).toHaveValue('Ana');
  });
});

describe('Button (presentacional)', () => {
  it('aplica la clase por variante (primary por defecto)', () => {
    render(
      <>
        <Button>Guardar</Button>
        <Button variant="secondary">Cancelar</Button>
        <Button variant="success">Confirmar</Button>
        <Button variant="danger">Eliminar</Button>
        <Button variant="ghost">Volver</Button>
      </>,
    );

    expect(screen.getByText('Guardar').className).toContain('bg-blue-600');
    expect(screen.getByText('Cancelar').className).toContain('bg-gray-200');
    expect(screen.getByText('Confirmar').className).toContain('bg-emerald-600');
    expect(screen.getByText('Eliminar').className).toContain('text-red-500');
    expect(screen.getByText('Volver').className).toContain('border');
  });

  it('deshabilitado no responde al click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Guardar</Button>);

    const boton = screen.getByRole('button', { name: 'Guardar' });
    expect(boton).toBeDisabled();
    await user.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('habilitado invoca onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
