import { useState } from 'react';
import { CrudPage } from '../components/CrudPage';
import { api } from '../services/api';

const soloActivos = <T extends { estado?: string }>(fn: () => Promise<T[]>) =>
  async () => (await fn()).filter(x => x.estado !== 'inactivo');

export function AlumnosPage() {
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');
  return <CrudPage title="Alumnos" columns={[
    { key: 'dni', label: 'DNI' }, { key: 'apellido', label: 'Apellido' }, { key: 'nombre', label: 'Nombre' },
    { key: 'telefono', label: 'Teléfono' },
  ]} fields={[
    { key: 'dni', label: 'DNI', required: true },
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'apellido', label: 'Apellido', required: true },
    { key: 'nacimiento', label: 'Fecha Nacimiento', type: 'date', required: true },
    { key: 'direccion', label: 'Dirección' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'fechaIngreso', label: 'Fecha Ingreso', type: 'date', required: true },
  ]} fetchFn={soloActivos(api.getAlumnos)} createFn={api.createAlumno} updateFn={api.updateAlumno} deleteFn={api.deleteAlumno}
  renderFilters={(data) => ({
    filtered: data.filter((a: any) => {
      const nombre = `${a.apellido} ${a.nombre}`.toLowerCase();
      const dni = String(a.dni ?? '');
      return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter);
    }),
    filters: <>
      <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
      <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
    </>
  })} />;
}

export function CursosPage() {
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  return <CrudPage title="Cursos" columns={[
    { key: 'anio', label: 'Año' }, { key: 'division', label: 'División' },
    { key: 'turno', label: 'Turno' }, { key: 'orientacion', label: 'Orientación' }, { key: 'cicloLectivo', label: 'Ciclo' },
  ]} fields={[
    { key: 'anio', label: 'Año', type: 'number', required: true, min: 1 },
    { key: 'division', label: 'División', required: true },
    { key: 'turno', label: 'Turno', options: [{ value: 'mañana', label: 'Mañana' }, { value: 'tarde', label: 'Tarde' }, { value: 'noche', label: 'Noche' }] },
    { key: 'orientacion', label: 'Orientación' },
    { key: 'cicloLectivo', label: 'Ciclo Lectivo', type: 'number', required: true, min: 1 },
  ]} fetchFn={soloActivos(api.getCursos)} createFn={api.createCurso} updateFn={api.updateCurso} deleteFn={api.deleteCurso}
  renderFilters={(data) => ({
    filtered: data.filter((c: any) =>
      (!anioFilter || c.anio === Number(anioFilter)) &&
      (!divisionFilter || c.division === divisionFilter) &&
      (!turnoFilter || c.turno === turnoFilter)
    ),
    filters: <>
      <select value={anioFilter} onChange={e => setAnioFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
        <option value="">Todos los años</option>
        {[...new Set(data.map((c: any) => c.anio))].sort().map(a => <option key={a} value={a}>{a}°</option>)}
      </select>
      <select value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
        <option value="">Todas las divisiones</option>
        {[...new Set(data
          .filter((c: any) => !anioFilter || c.anio === Number(anioFilter))
          .map((c: any) => c.division))].sort().map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={turnoFilter} onChange={e => setTurnoFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
        <option value="">Todos los turnos</option>
        {[...new Set(data
          .filter((c: any) => (!anioFilter || c.anio === Number(anioFilter)) && (!divisionFilter || c.division === divisionFilter))
          .map((c: any) => c.turno))].sort().map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </>
  })} />;
}

export function DocentesPage() {
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');
  const today = new Date().toISOString().split('T')[0];
  return <CrudPage title="Docentes" columns={[
    { key: 'dni', label: 'DNI' }, { key: 'apellido', label: 'Apellido' }, { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' }, { key: 'telefono', label: 'Teléfono' },
  ]} fields={[
    { key: 'dni', label: 'DNI', required: true },
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'apellido', label: 'Apellido', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'fechaIngreso', label: 'Fecha Ingreso', type: 'date', required: true, max: today },
  ]} fetchFn={soloActivos(api.getDocentes)} createFn={api.createDocente} updateFn={api.updateDocente} deleteFn={api.deleteDocente}
  renderFilters={(data) => ({
    filtered: data.filter((d: any) => {
      const nombre = `${d.apellido} ${d.nombre}`.toLowerCase();
      const dni = String(d.dni ?? '');
      return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter);
    }),
    filters: <>
      <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
      <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
    </>
  })} />;
}

export function MateriasPage() {
  const [search, setSearch] = useState('');
  return <CrudPage title="Materias" columns={[
    { key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' },
  ]} fields={[
    { key: 'nombre', label: 'Nombre', required: true },
  ]} fetchFn={api.getMaterias} createFn={api.createMateria} updateFn={api.updateMateria} deleteFn={api.deleteMateria}
  renderFilters={(data) => ({
    filtered: data.filter((m: any) => m.nombre?.toLowerCase().includes(search.toLowerCase())),
    filters: <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar materia..." className="w-60 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
  })} />;
}
