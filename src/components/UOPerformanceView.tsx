import React from 'react';
import { Building2, CheckCircle2, Clock, AlertOctagon, Target, ArrowRight } from 'lucide-react';
import { Task, Catalogs } from '../types';

interface UOPerformanceViewProps {
  tasks: Task[];
  catalogs: Catalogs;
  onFilterUO: (uo: string) => void;
}

export const UOPerformanceView: React.FC<UOPerformanceViewProps> = ({
  tasks,
  catalogs,
  onFilterUO
}) => {
  // Compute metrics per UO
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

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        borderLeft: '5px solid var(--msm-navy)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--msm-navy)' }}>
          Consolidado Operativo y Auditoría por Unidad Operativa (UO)
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
          Seguimiento comparativo de los {catalogs.uos.length} centros de operación asistencial y administrativa de Mundo Salud Médica
        </p>
      </div>

      {/* Grid of UO Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {uoMetrics.map(u => (
          <div
            key={u.uo}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* UO Badge & Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{
                  backgroundColor: 'var(--msm-navy)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {u.uo}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                  <strong>{u.total}</strong> tareas registradas
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Tasa de Eficacia Global</span>
                  <span style={{ fontWeight: 800, color: u.pctEficacia >= 85 ? '#059669' : (u.pctEficacia >= 70 ? '#D97706' : '#DC2626') }}>
                    {u.pctEficacia}%
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${u.pctEficacia}%`,
                    height: '100%',
                    backgroundColor: u.pctEficacia >= 85 ? '#10B981' : (u.pctEficacia >= 70 ? '#F59E0B' : '#EF4444'),
                    borderRadius: 'var(--radius-full)'
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
                <div>Cumplimiento SLA Oportuno: <strong style={{ color: 'var(--msm-navy)' }}>{u.pctSLA}%</strong></div>
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
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--msm-blue)',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              <span>Ver tareas de {u.uo}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
