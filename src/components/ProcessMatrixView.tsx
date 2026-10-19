import React from 'react';
import { Briefcase, AlertOctagon, CheckCircle2, ArrowRight, FilterX } from 'lucide-react';
import { Task, Catalogs } from '../types';
import { MONTH_NAMES } from '../utils/filters';

interface ProcessMatrixViewProps {
  tasks: Task[];
  catalogs: Catalogs;
  selectedUO?: string;
  selectedYear?: string;
  selectedMonth?: string;
  selectedRole?: string;
  onFilterProcess: (proceso: string) => void;
  onClearFilters?: () => void;
}

export const ProcessMatrixView: React.FC<ProcessMatrixViewProps> = ({
  tasks,
  catalogs,
  selectedUO,
  selectedYear,
  selectedMonth,
  selectedRole,
  onFilterProcess,
  onClearFilters
}) => {
  // Aggregate per process
  const processStats = catalogs.procesos.map(proc => {
    const pTasks = tasks.filter(t => t.proceso === proc);
    const total = pTasks.length;
    const cumplidas = pTasks.filter(t => t.estado.startsWith('CUMPLIDA')).length;
    const noCumplidas = pTasks.filter(t => t.estado === 'NO CUMPLIDA').length;
    const pendientes = pTasks.filter(t => t.estado === 'PENDIENTE').length;
    const pct = total > 0 ? Math.round((cumplidas / total) * 100) : 0;

    return {
      proceso: proc,
      total,
      cumplidas,
      noCumplidas,
      pendientes,
      pct
    };
  }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  const isFiltered = Boolean(selectedUO || selectedYear || selectedMonth || (selectedRole && selectedRole !== 'TODOS'));

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        borderLeft: '5px solid var(--msm-accent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--msm-navy)' }}>
            Matriz de Procesos Misionales de Facturación en Salud
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Seguimiento a las actividades del ciclo integral de ingresos: Admisiones, Liquidación, Radicación, Glosas y Cobro
            {isFiltered && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--msm-blue)', fontWeight: 600 }}>
                • Filtrado por {selectedUO ? `Sede: ${selectedUO} ` : ''}
                {selectedYear ? `• Año: ${selectedYear} ` : ''}
                {selectedMonth ? `• Mes: ${MONTH_NAMES[selectedMonth] || selectedMonth} ` : ''}
                {selectedRole && selectedRole !== 'TODOS' ? `• Perfil: ${selectedRole} ` : ''}
                ({tasks.length} tareas evaluadas)
              </span>
            )}
          </p>
        </div>

        {isFiltered && onClearFilters && (
          <button
            onClick={onClearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Limpiar filtros para ver todos los procesos en general"
          >
            <FilterX size={14} />
            <span>Ver Todos los Procesos</span>
          </button>
        )}
      </div>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {processStats.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No se registran tareas de facturación en el alcance seleccionado.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Prueba seleccionando otra sede, mes o limpiando los filtros para ver el global.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--msm-navy)', color: '#FFFFFF' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Proceso Evaluado</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', width: '120px' }}>Total Tareas</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', width: '120px' }}>Cumplidas</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', width: '130px' }}>Vencidas</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', width: '120px' }}>Pendientes</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '220px' }}>% Eficacia</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center', width: '120px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {processStats.map((p, index) => (
                <tr 
                  key={p.proceso}
                  style={{ 
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                  }}
                >
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--msm-navy)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Briefcase size={16} color="var(--msm-blue)" />
                      <span>{p.proceso}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontWeight: 600 }}>
                    {p.total}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', color: '#047857', fontWeight: 600 }}>
                    {p.cumplidas}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', color: p.noCumplidas > 0 ? '#DC2626' : '#94A3B8', fontWeight: 600 }}>
                    {p.noCumplidas}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', color: '#2563EB', fontWeight: 600 }}>
                    {p.pendientes}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        flex: 1,
                        height: '7px',
                        backgroundColor: '#F1F5F9',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${p.pct}%`,
                          height: '100%',
                          backgroundColor: p.pct >= 85 ? '#10B981' : (p.pct >= 70 ? '#F59E0B' : '#EF4444'),
                          borderRadius: 'var(--radius-full)'
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#334155', minWidth: '40px' }}>
                        {p.pct}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    <button
                      onClick={() => onFilterProcess(p.proceso)}
                      style={{
                        color: 'var(--msm-blue)',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        margin: '0 auto'
                      }}
                    >
                      <span>Ver tareas</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
