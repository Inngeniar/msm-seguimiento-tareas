import React from 'react';
import { Building2, CheckCircle2, Clock, AlertOctagon, Target, ArrowRight, FilterX } from 'lucide-react';
import { Task, Catalogs } from '../types';
import { MONTH_NAMES } from '../utils/filters';

interface UOPerformanceViewProps {
  tasks: Task[];
  catalogs: Catalogs;
  selectedUO?: string;
  selectedYear?: string;
  selectedMonth?: string;
  selectedRole?: string;
  onFilterUO: (uo: string) => void;
  onClearFilters?: () => void;
}

export const UOPerformanceView: React.FC<UOPerformanceViewProps> = ({
  tasks,
  catalogs,
  selectedUO,
  selectedYear,
  selectedMonth,
  selectedRole,
  onFilterUO,
  onClearFilters
}) => {
  // Compute metrics per UO based on current tasks in scope
  const uoMetrics = catalogs.uos.map(uo => {
    const uoTasks = tasks.filter(t => t.uo === uo);
    const total = uoTasks.length;
    const cumplidasATiempo = uoTasks.filter(t => t.estado === 'CUMPLIDA A TIEMPO').length;
    const cumplidasConAtraso = uoTasks.filter(t => t.estado === 'CUMPLIDA CON ATRASO').length;
    const pendientes = uoTasks.filter(t => t.estado === 'PENDIENTE').length;
    const noCumplidas = uoTasks.filter(t => t.estado === 'NO CUMPLIDA').length;

    const ejecutadas = cumplidasATiempo + cumplidasConAtraso;
    const pctEficacia = total > 0 ? Math.round((ejecutadas / total) * 100) : 0;
    const denomSLA = cumplidasATiempo + cumplidasConAtraso + noCumplidas;
    const pctSLA = denomSLA > 0 ? Math.round((cumplidasATiempo / denomSLA) * 100) : 0;

    const retrasos = uoTasks.map(t => t.retrasoDias || 0).filter(d => d > 0);
    const avgRetraso = retrasos.length > 0 ? Math.round((retrasos.reduce((a, b) => a + b, 0) / retrasos.length) * 10) / 10 : 0;

    return {
      uo,
      total,
      cumplidasATiempo,
      cumplidasConAtraso,
      pendientes,
      noCumplidas,
      pctEficacia,
      pctSLA,
      avgRetraso
    };
  }).sort((a, b) => b.total - a.total);

  const isFiltered = Boolean(selectedYear || selectedMonth || (selectedRole && selectedRole !== 'TODOS') || selectedUO);

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        borderLeft: '5px solid var(--msm-navy)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--msm-navy)' }}>
            Consolidado Operativo y Auditoría por Unidad Operativa (UO)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Seguimiento comparativo de los {catalogs.uos.length} centros de operación asistencial y administrativa de Mundo Salud Médica
            {isFiltered && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--msm-blue)', fontWeight: 600 }}>
                • Filtrado por {selectedYear ? `Año: ${selectedYear} ` : ''}
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
            title="Limpiar filtros para ver el consolidado general completo"
          >
            <FilterX size={14} />
            <span>Ver Todas las Sedes / Periodos</span>
          </button>
        )}
      </div>

      {/* Grid of UO Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {uoMetrics.map(u => {
          const isSelected = selectedUO === u.uo;
          return (
            <div
              key={u.uo}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'var(--shadow-sm)',
                border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* UO Badge & Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      backgroundColor: isSelected ? '#0284C7' : 'var(--msm-navy)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      {u.uo}
                    </span>
                    {isSelected && (
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700
                      }}>
                        SEDE ACTIVA
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                    <strong>{u.total}</strong> tareas registradas
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Tasa de Eficacia Global</span>
                    <span style={{ fontWeight: 800, color: u.total === 0 ? '#94A3B8' : (u.pctEficacia >= 85 ? '#059669' : (u.pctEficacia >= 70 ? '#D97706' : '#DC2626')) }}>
                      {u.total === 0 ? 'N/A' : `${u.pctEficacia}%`}
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: u.total === 0 ? '0%' : `${u.pctEficacia}%`,
                      height: '100%',
                      backgroundColor: u.pctEficacia >= 85 ? '#10B981' : (u.pctEficacia >= 70 ? '#F59E0B' : '#EF4444'),
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {/* Status pills breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
                  <div style={{ backgroundColor: '#ECFDF5', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', color: '#065F46' }}>
                    <strong>{u.cumplidasATiempo}</strong> A Tiempo
                  </div>
                  <div style={{ backgroundColor: '#FFFBEB', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', color: '#92400E' }}>
                    <strong>{u.cumplidasConAtraso}</strong> Con Atraso
                  </div>
                  <div style={{ backgroundColor: u.noCumplidas > 0 ? '#FEF2F2' : '#F1F5F9', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', color: u.noCumplidas > 0 ? '#991B1B' : '#64748B' }}>
                    <strong>{u.noCumplidas}</strong> Vencidas
                  </div>
                  <div style={{ backgroundColor: '#EFF6FF', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', color: '#1E40AF' }}>
                    <strong>{u.pendientes}</strong> Pendientes
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                  <div>Cumplimiento SLA Oportuno: <strong style={{ color: 'var(--msm-navy)' }}>{u.total > 0 ? `${u.pctSLA}%` : 'N/A'}</strong></div>
                  {u.avgRetraso > 0 && (
                    <div>Desvío promedio en mora: <strong style={{ color: '#DC2626' }}>{u.avgRetraso} días</strong></div>
                  )}
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={() => onFilterUO(u.uo)}
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  backgroundColor: isSelected ? '#E0F2FE' : '#F8FAFC',
                  border: isSelected ? '1px solid #7DD3FC' : '1px solid #CBD5E1',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-md)',
                  color: isSelected ? '#0369A1' : 'var(--msm-blue)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <span>{isSelected ? `Viendo tareas de ${u.uo}` : `Ver tareas de ${u.uo}`}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
