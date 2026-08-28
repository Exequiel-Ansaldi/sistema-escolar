import { useState } from 'react';
import { CrudPage } from '../components/CrudPage';
import { FormModal, Button } from '../components/ui';
import { CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export function AlumnosPage() {
  const [search, setSearch] = useState('');
  const [created, setCreated] = useState<any | null>(null);
  return <>
    <CrudPage title="Alumnos" columns={[
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
  ]} fetchFn={api.getAlumnos} createFn={api.createAlumno} updateFn={api.updateAlumno} deleteFn={api.deleteAlumno}
  filterParams={search ? { search } : {}}
  onCreated={setCreated}
  renderFilters={() => <>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por DNI, nombre o apellido..." className="w-full sm:w-72 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
  </>} />
    {created && (
      <FormModal title="Alumno creado" onClose={() => setCreated(null)}>
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle size={52} className="text-emerald-500" />
          <p className="text-center text-slate-700">
            <strong>{created.apellido}, {created.nombre}</strong> fue creado con éxito
          </p>
          <Button variant="primary" onClick={() => setCreated(null)}>Listo</Button>
        </div>
      </FormModal>
    )}
  </>;
}

export function CursosPage() {
  const [anioFilter, setAnioFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const filterParams: Record<string, string> = {};
  if (anioFilter) filterParams.anio = anioFilter;
  if (divisionFilter) filterParams.division = divisionFilter;
  if (turnoFilter) filterParams.turno = turnoFilter;
  return <CrudPage title="Cursos" columns={[
    { key: 'anio', label: 'Año' }, { key: 'division', label: 'División' },
    { key: 'turno', label: 'Turno' }, { key: 'orientacion', label: 'Orientación' }, { key: 'cicloLectivo', label: 'Ciclo' },
  ]} fields={[
    { key: 'anio', label: 'Año', type: 'number', required: true, min: 1 },
    { key: 'division', label: 'División', required: true },
    { key: 'turno', label: 'Turno', options: [{ value: 'mañana', label: 'Mañana' }, { value: 'tarde', label: 'Tarde' }, { value: 'noche', label: 'Noche' }] },
    { key: 'orientacion', label: 'Orientación' },
    { key: 'cicloLectivo', label: 'Ciclo Lectivo', type: 'number', required: true, min: 1 },
  ]} fetchFn={api.getCursos} createFn={api.createCurso} updateFn={api.updateCurso} deleteFn={api.deleteCurso}
  filterParams={filterParams}
  renderFilters={() => <>
    <input value={anioFilter} onChange={e => setAnioFilter(e.target.value)} placeholder="Año" type="number" className="w-20 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
    <input value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)} placeholder="División" className="w-24 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
    <select value={turnoFilter} onChange={e => setTurnoFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
      <option value="">Todos los turnos</option>
      <option value="mañana">Mañana</option>
      <option value="tarde">Tarde</option>
      <option value="noche">Noche</option>
    </select>
  </>} />;
}

export function DocentesPage() {
  const [search, setSearch] = useState('');
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
  ]} fetchFn={api.getDocentes} createFn={api.createDocente} updateFn={api.updateDocente} deleteFn={api.deleteDocente}
  filterParams={search ? { search } : {}}
  renderFilters={() => <>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por DNI, nombre o apellido..." className="w-full sm:w-72 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
  </>} />;
}

export function MateriasPage() {
  const [search, setSearch] = useState('');
  return <CrudPage title="Materias" columns={[
    { key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' },
  ]} fields={[
    { key: 'nombre', label: 'Nombre', required: true },
  ]} fetchFn={api.getMaterias} createFn={api.createMateria} updateFn={api.updateMateria} deleteFn={api.deleteMateria}
  filterParams={search ? { search } : {}}
  renderFilters={() => <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar materia..." className="w-60 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />}
  />;
}
