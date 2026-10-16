import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  FilterX
} from 'lucide-react';
import { Task, KPIStats, UserRole } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  allTasks: Task[];
  kpis: KPIStats;
  selectedUO: string;
  setSelectedUO: (uo: string) => void;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  onSelectTask: (task: Task) => void;
  onQuickComplete: (taskId: string) => void;
  onViewAllTasks: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  allTasks,
  kpis,
  selectedUO,
  setSelectedUO,
  selectedRole,
  setSelectedRole,
  onSelectTask,
  onQuickComplete,
  onViewAllTasks
}) => {
  // Overdue and critical tasks in the current scope
  const overdueTasks = tasks
    .filter(t => t.estado === 'NO CUMPLIDA')
    .sort((a, b) => (b.retrasoDias || 0) - (a.retrasoDias || 0))
    .slice(0, 6);

  // Status distribution for status bars
  const statusCounts = [
    { label: 'Cumplida a Tiempo', count: kpis.cumplidasATiempo, color: '#10B981', pct: kpis.total ? Math.round((kpis.cumplidasATiempo / kpis.total) * 100) : 0 },
    { label: 'Cumplida c/ Atraso', count: kpis.cumplidasConAtraso, color: '#F59E0B', pct: kpis.total ? Math.round((kpis.cumplidasConAtraso / kpis.total) * 100) : 0 },
    { label: 'No Cumplida / Vencida', count: kpis.noCumplidas, color: '#EF4444', pct: kpis.total ? Math.round((kpis.noCumplidas / kpis.total) * 100) : 0 },
    { label: 'Pendiente Vigente', count: kpis.pendientes, color: '#3B82F6', pct: kpis.total ? Math.round((kpis.pendientes / kpis.total) * 100) : 0 },
    { label: 'Sin Fecha Compromiso', count: kpis.sinFecha, color: '#94A3B8', pct: kpis.total ? Math.round((kpis.sinFecha / kpis.total) * 100) : 0 }
  ];

  // Group by UO across ALL tasks for the comparative table, but highlight the selected one
  const uoMap: { [key: string]: { total: number; cumplidas: number; noCumplidas: number; pct: number } } = {};
  allTasks.forEach(t => {
    if (!uoMap[t.uo]) {
      uoMap[t.uo] = { total: 0, cumplidas: 0, noCumplidas: 0, pct: 0 };
    }
    uoMap[t.uo].total++;
    if (t.estado.startsWith('CUMPLIDA')) uoMap[t.uo].cumplidas++;
    if (t.estado === 'NO CUMPLIDA') uoMap[t.uo].noCumplidas++;
  });

  const uoRankings = Object.entries(uoMap)
    .map(([uo, d]) => ({
      uo,
      total: d.total,
      cumplidas: d.cumplidas,
      noCumplidas: d.noCumplidas,
      pct: Math.round((d.cumplidas / d.total) * 100)
    }))
    .sort((a, b) => b.total - a.total);

  // Group by Process in the current scope
  const procMap: { [key: string]: { total: number; noCumplidas: number } } = {};
  tasks.forEach(t => {
    if (!procMap[t.proceso]) {
      procMap[t.proceso] = { total: 0, noCumplidas: 0 };
    }
    procMap[t.proceso].total++;
    if (t.estado === 'NO CUMPLIDA') procMap[t.proceso].noCumplidas++;
  });

  const processRankings = Object.entries(procMap)
    .map(([proc, d]) => ({ proceso: proc, total: d.total, noCumplidas: d.noCumplidas }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  const isFiltered = Boolean(selectedUO || (selectedRole && selectedRole !== 'TODOS'));

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Scope Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '1.1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        borderLeft: isFiltered ? '6px solid var(--msm-accent)' : '6px solid var(--msm-navy)',
        border: '1px solid #E2E8F0',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--msm-navy)' }}>
              Panel Ejecutivo de Eficacia Operativa y Calidad
            </h2>
            {isFiltered && (
              <span style={{
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #BFDBFE'
              }}>
                VISTA FILTRADA
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '3px' }}>
            {selectedUO ? (
              <>Sede activa: <strong style={{ color: 'var(--msm-navy)', backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{selectedUO}</strong></>
            ) : (
              <>Sedes: <strong style={{ color: 'var(--msm-blue)' }}>Todas las Unidades Operativas (Consolidado Nacional)</strong></>
            )}
            {selectedRole !== 'TODOS' && (
              <> • Perfil: <strong style={{ color: '#0369A1', backgroundColor: '#F0F9FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{selectedRole}</strong></>
            )}
            {' '} • Analizando <strong>{tasks.length}</strong> tareas de {allTasks.length} totales
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isFiltered && (
            <button
              onClick={() => { setSelectedUO(''); setSelectedRole('TODOS'); }}
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
                fontWeight: 700
              }}
            >
              <FilterX size={14} />
              <span>Ver Consolidado Global</span>
            </button>
          )}

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <Activity size={15} />
            Eficacia: {kpis.pctEficaciaGlobal.toFixed(1)}%
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: kpis.pctOportunidadSLA >= 75 ? '#ECFDF5' : '#FEF2F2',
            color: kpis.pctOportunidadSLA >= 75 ? '#065F46' : '#991B1B',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <Target size={15} />
            SLA: {kpis.pctOportunidadSLA.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 7 KPI SCORECARDS (Dynamically update based on selected UO / Role) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Total */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid var(--msm-navy)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Total Tareas
            </span>
            <Activity size={18} color="var(--msm-navy)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--msm-navy)', marginTop: '0.4rem' }}>
            {kpis.total}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>En este alcance</span>
        </div>

        {/* Cumplidas a Tiempo */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid #10B981'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              A Tiempo (SLA)
            </span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#047857', marginTop: '0.4rem' }}>
            {kpis.cumplidasATiempo}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
            {kpis.total ? Math.round((kpis.cumplidasATiempo / kpis.total) * 100) : 0}% de la sede
          </span>
        </div>

        {/* Cumplidas con Atraso */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid #F59E0B'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
              Con Atraso
            </span>
            <Clock size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#B45309', marginTop: '0.4rem' }}>
            {kpis.cumplidasConAtraso}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
            {kpis.total ? Math.round((kpis.cumplidasConAtraso / kpis.total) * 100) : 0}% de la sede
          </span>
        </div>

        {/* No Cumplidas / Vencidas */}
        <div style={{
          backgroundColor: '#FEF2F2',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid #EF4444'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>
              No Cumplidas / Vencidas
            </span>
            <AlertOctagon size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#DC2626', marginTop: '0.4rem' }}>
            {kpis.noCumplidas}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>
            {kpis.noCumplidas > 0 ? 'Requieren Gestión Urgente' : 'Al día, sin vencimientos'}
          </span>
        </div>

        {/* Pendientes Vigentes */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid #3B82F6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>
              Pendientes
            </span>
            <AlertTriangle size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D4ED8', marginTop: '0.4rem' }}>
            {kpis.pendientes}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>En plazo vigente</span>
        </div>

        {/* Eficacia Global % */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid var(--msm-blue)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--msm-navy)', textTransform: 'uppercase' }}>
              Eficacia Global
            </span>
            <TrendingUp size={18} color="var(--msm-blue)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--msm-blue)', marginTop: '0.4rem' }}>
            {kpis.pctEficaciaGlobal.toFixed(1)}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Cumplidas / Total</span>
        </div>

        {/* Promedio Retraso Días */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          boxShadow: 'var(--shadow-sm)',
          borderTop: '4px solid #8B5CF6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase' }}>
              Desvío Promedio
            </span>
            <Calendar size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#6D28D9', marginTop: '0.4rem' }}>
            {kpis.promedioRetrasoDias}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6D28D9', fontWeight: 600 }}>Días de mora</span>
        </div>
      </div>

      {/* CRITICAL ALERTS: OVERDUE TASKS BANNER */}
      {overdueTasks.length > 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '1.75rem',
          border: '1px solid #FCA5A5'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                <AlertOctagon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991B1B' }}>
                  Atención Prioritaria: Tareas Críticas Vencidas ({kpis.noCumplidas})
                  {selectedUO && ` en ${selectedUO}`}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Actividades cuya fecha compromiso ya expiró sin registro de ejecución.
                </p>
              </div>
            </div>
            <button
              onClick={onViewAllTasks}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--msm-blue)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <span>Ver todas en la matriz ({tasks.length})</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '0.85rem'
          }}>
            {overdueTasks.map(t => (
              <div
                key={t.id}
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      backgroundColor: 'var(--msm-navy)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {t.uo}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                      {t.proceso}
                    </span>
                    <span style={{
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      +{t.retrasoDias}d mora
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 600, lineHeight: 1.3 }}>
                    {t.tarea}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem' }}>
                    Compromiso: <strong>{t.fechaCompromiso}</strong> • Resp: {t.responsable}
                  </p>
                </div>

                <button
                  onClick={() => onQuickComplete(t.id)}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    alignSelf: 'center',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
                  }}
                  title="Marcar como cumplida e ingresar observación"
                >
                  Cumplir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS & RANKINGS SECTION */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.75rem'
      }}>
        {/* Status Distribution Breakdown */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--msm-navy)', marginBottom: '1.25rem' }}>
            Distribución del Estado de Tareas {selectedUO ? `en ${selectedUO}` : ''}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {statusCounts.map((sc, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{sc.label}</span>
                  <span style={{ fontWeight: 700, color: sc.color }}>
                    {sc.count} ({sc.pct}%)
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${sc.pct}%`,
                    height: '100%',
                    backgroundColor: sc.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Processes Activity */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--msm-navy)', marginBottom: '1.25rem' }}>
            Volumen por Proceso de Facturación {selectedUO ? `en ${selectedUO}` : ''}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {processRankings.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No hay tareas en este alcance
              </p>
            ) : (
              processRankings.map((pr, i) => {
                const maxVal = processRankings[0]?.total || 1;
                const barPct = Math.round((pr.total / maxVal) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{pr.proceso}</span>
                      <span style={{ color: '#64748B' }}>
                        <strong style={{ color: 'var(--msm-blue)' }}>{pr.total}</strong> tareas
                        {pr.noCumplidas > 0 && (
                          <span style={{ color: '#DC2626', marginLeft: '0.5rem', fontWeight: 600 }}>
                            ({pr.noCumplidas} vencidas)
                          </span>
                        )}
                      </span>
                    </div>
                    <div style={{
                      height: '7px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${barPct}%`,
                        height: '100%',
                        backgroundColor: 'var(--msm-accent)',
                        borderRadius: 'var(--radius-full)'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* UO RANKING TABLE (Showing comparison, highlighting active UO) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--msm-navy)' }}>
              Comparativa de Eficacia entre Unidades Operativas
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Haz clic en cualquier sede para enfocar el análisis en ella
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Unidad Operativa</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Total Asignadas</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Cumplidas</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Vencidas / No Cumplidas</th>
                <th style={{ padding: '0.75rem 1rem' }}>Tasa de Eficacia</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {uoRankings.map((u, i) => {
                const isSelected = selectedUO === u.uo;
                return (
                  <tr 
                    key={i} 
                    style={{ 
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                      fontWeight: isSelected ? 700 : 'normal'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--msm-navy)' }}>
                      <span style={{
                        backgroundColor: isSelected ? '#0284C7' : 'var(--msm-navy)',
                        color: '#FFFFFF',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        marginRight: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {u.uo}
                      </span>
                      {isSelected && <span style={{ color: '#0284C7', fontSize: '0.75rem' }}>(Sede seleccionada)</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                      {u.total}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#047857', fontWeight: 600 }}>
                      {u.cumplidas}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: u.noCumplidas > 0 ? '#DC2626' : '#94A3B8', fontWeight: 600 }}>
                      {u.noCumplidas}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          flex: 1,
                          height: '7px',
                          backgroundColor: '#F1F5F9',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${u.pct}%`,
                            height: '100%',
                            backgroundColor: u.pct >= 85 ? '#10B981' : (u.pct >= 70 ? '#F59E0B' : '#EF4444'),
                            borderRadius: 'var(--radius-full)'
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#334155', minWidth: '40px' }}>
                          {u.pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {isSelected ? (
                        <button
                          onClick={() => setSelectedUO('')}
                          style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline' }}
                        >
                          Quitar filtro
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedUO(u.uo)}
                          style={{ color: 'var(--msm-accent)', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Filtrar por {u.uo}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
