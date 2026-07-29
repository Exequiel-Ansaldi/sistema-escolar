import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle, AlertCircle, Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column { key: string; label: string; render?: (value: any, row: any) => ReactNode; }

export function DataTable({ columns, data, onEdit, onDelete, loading }: { columns: Column[]; data: any[]; onEdit?: (row: any) => void; onDelete?: (row: any) => void; loading?: boolean }) {
  if (loading) return <div className="text-center py-12 text-gray-400 animate-pulse">Cargando...</div>;
  if (!data.length) return <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">No hay datos</div>;
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map(c => <th key={c.key} className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">{c.label}</th>)}
            {(onEdit || onDelete) && <th className="px-5 py-3.5 w-28" />}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => <tr key={row.id ?? i} className={`border-b border-gray-100 transition-colors hover:bg-blue-50/40 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
            {columns.map(c => <td key={c.key} className="px-5 py-3 text-gray-700">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
            {(onEdit || onDelete) && <td className="px-5 py-3"><div className="flex items-center justify-end gap-1">
              {onEdit && <button onClick={() => onEdit(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar"><Pencil size={16} /></button>}
              {onDelete && <button onClick={() => onDelete(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Eliminar"><Trash2 size={16} /></button>}
            </div></td>}
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function FormModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-2 max-h-[85vh] overflow-y-auto animate-slide-up border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onCancel, loading }: { title: string; message: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up border border-gray-200 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-red-50 text-red-500"><AlertTriangle size={24} /></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input {...props} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
    </div>
  );
}

export function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select {...props} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
        {children}
      </select>
    </div>
  );
}

export function Card({ title, value, icon, color = 'blue', to }: { title: string; value: string | number; icon: ReactNode; color?: 'blue' | 'green' | 'orange' | 'purple'; to?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
  };
  const inner = <>
    <div className={`p-3 rounded-xl ${colors[color]} shadow-sm`}><div className="text-white">{icon}</div></div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{title}</div>
    </div>
  </>;
  if (to) return <Link to={to} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-5 flex items-center gap-4 cursor-pointer no-underline">{inner}</Link>;
  return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">{inner}</div>;
}

export function Button({ children, variant = 'primary', ...props }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    danger: 'text-red-500 hover:text-red-700 bg-transparent',
    ghost: 'border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white',
  };
  return <button {...props} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ''}`}>{children}</button>;
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={18} /></button>
      {pages.map((p, i) =>
        p === '...' ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">...</span> :
          <button key={p} onClick={() => onPageChange(p)} className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
      )}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight size={18} /></button>
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
      <div className={`${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium`}>
        <Icon size={18} />
        {message}
        <button onClick={onClose} className="ml-2 hover:opacity-80"><X size={16} /></button>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'success' | 'danger' | 'warning' | 'default' }) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    danger: 'bg-red-50 text-red-700 ring-red-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    default: 'bg-gray-100 text-gray-700 ring-gray-600/20',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[variant]}`}>{children}</span>;
}
