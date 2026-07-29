import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { DataTable, FormModal, Select, Input, Button, Toast } from '../components/ui';

export function ActasPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [actas, setActas] = useState<any[]>([]);
  const [acuerdos, setAcuerdos] = useState<any[]>([]);
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [tutores, setTutores] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [tab, setTab] = useState<'actas' | 'acuerdos' | 'seguimientos' | 'tutores'>('actas');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dniFilter, setDniFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');

  useEffect(() => { api.getAlumnos().then(a => setAlumnos(a.filter((x: any) => x.estado === 'activo'))); }, []);

  const load = useCallback(async () => {
    if (!alumnoId) return;
    const id = Number(alumnoId);
    const [ac, ag, seg, tut] = await Promise.all([api.getActas(id), api.getAcuerdos(id), api.getSeguimientos(id), api.getTutores(id)]);
    setActas(ac); setAcuerdos(ag); setSeguimientos(seg); setTutores(tut);
  }, [alumnoId]);

  useEffect(() => { load(); }, [load]);

  const createEntry = async (body: any) => {
    if (tab === 'actas') await api.createActa(body);
    else if (tab === 'acuerdos') await api.createAcuerdo(body);
    else if (tab === 'seguimientos') await api.createSeguimiento(body);
    else await api.createTutor({ alumnoId: Number(alumnoId), ...body });
    setToast({ message: `${tab.slice(0, -1)} creado con éxito`, type: 'success' }); setShowForm(false); load();
  };

  const tabs = [
    { key: 'actas' as const, label: 'Actas' },
    { key: 'acuerdos' as const, label: 'Acuerdos' },
    { key: 'seguimientos' as const, label: 'Seguimientos' },
    { key: 'tutores' as const, label: 'Tutores' },
  ];

  const alumnosFiltrados = alumnos.filter(a => {
    const nombre = `${a.apellido} ${a.nombre}`.toLowerCase();
    const dni = String(a.dni ?? '');
    return nombre.includes(nombreFilter.toLowerCase()) && dni.includes(dniFilter);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Actas, Acuerdos & Tutores</h1>
          <p className="text-slate-500 text-sm mt-1">Documentación académica por alumno</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input value={dniFilter} onChange={e => setDniFilter(e.target.value)} placeholder="DNI" className="w-full sm:w-32 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input value={nombreFilter} onChange={e => setNombreFilter(e.target.value)} placeholder="Nombre" className="w-full sm:w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)} className="border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">Alumno</option>
            {alumnosFiltrados.map(a => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="border-b border-slate-200 flex items-center gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
        ))}
        <button onClick={() => setShowForm(true)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors mb-2">+ Nuevo</button>
      </div>

      {tab === 'actas' && <DataTable columns={[
        { key: 'numero', label: 'N°' }, { key: 'tipo', label: 'Tipo' }, { key: 'descripcion', label: 'Descripción' },
        { key: 'fecha', label: 'Fecha', render: (v: string) => new Date(v).toLocaleDateString() },
      ]} data={actas} />}
      {tab === 'acuerdos' && <DataTable columns={[
        { key: 'tipo', label: 'Tipo' }, { key: 'descripcion', label: 'Descripción' }, { key: 'estado', label: 'Estado' },
        { key: 'fecha', label: 'Fecha', render: (v: string) => new Date(v).toLocaleDateString() },
      ]} data={acuerdos} />}
      {tab === 'seguimientos' && <DataTable columns={[
        { key: 'titulo', label: 'Título' }, { key: 'tipo', label: 'Tipo' }, { key: 'descripcion', label: 'Descripción' },
        { key: 'estado', label: 'Estado' }, { key: 'fecha', label: 'Fecha', render: (v: string) => new Date(v).toLocaleDateString() },
      ]} data={seguimientos} />}

      {tab === 'tutores' && <DataTable columns={[
        { key: 'nombre', label: 'Nombre' }, { key: 'apellido', label: 'Apellido' }, { key: 'dni', label: 'DNI' },
      ]} data={tutores} onDelete={async (row) => { await api.deleteTutor(row.id); setToast({ message: 'Tutor eliminado', type: 'success' }); load(); }} />}

      {showForm && <FormModal title={`Nuevo ${tab.slice(0, -1)}`} onClose={() => setShowForm(false)}>
        <form onSubmit={e => { e.preventDefault(); createEntry(Object.fromEntries(new FormData(e.currentTarget))); }}>
          {tab === 'actas' && <><Input label="Número" name="numero" required /><Input label="Tipo" name="tipo" required /></>}
          {tab === 'acuerdos' && <Select label="Tipo" name="tipo"><option value="docente">Docente</option><option value="alumno">Alumno</option><option value="familia">Familia</option></Select>}
          {tab === 'seguimientos' && <><Input label="Título" name="titulo" required /><Select label="Tipo" name="tipo"><option value="academico">Académico</option><option value="conductual">Conductual</option></Select></>}
          {tab === 'tutores' && <><Input label="Nombre" name="nombre" required /><Input label="Apellido" name="apellido" required /><Input label="DNI" name="dni" required /></>}
          {tab !== 'tutores' && <Input label="Descripción" name="descripcion" required />}
          <Button type="submit" variant="primary">Guardar</Button>
        </form>
      </FormModal>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
