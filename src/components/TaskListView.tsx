import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Task, TaskStatus, Catalogs } from '../types';

interface TaskListViewProps {
  tasks: Task[];
  catalogs: Catalogs;
  selectedUO: string;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  catalogs,
  selectedUO,
  onEditTask,
  onCompleteTask,
  onDeleteTask
}) => {
  const [search, setSearch] = useState('');
  const [filterUO, setFilterUO] = useState(selectedUO || '');
  const [filterProceso, setFilterProceso] = useState('');
  const [filterResponsable, setFilterResponsable] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null);

  const pageSize = 25;

  // Sync if selectedUO changes in navbar
  React.useEffect(() => {
    if (selectedUO !== undefined) {
      setFilterUO(selectedUO);
      setCurrentPage(1);
    }
  }, [selectedUO]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterUO && t.uo !== filterUO) return false;
      if (filterProceso && t.proceso !== filterProceso) return false;
      if (filterResponsable && t.responsable !== filterResponsable) return false;
      if (filterEstado && t.estado !== filterEstado) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchText = (
          (t.tarea || '') + ' ' +
          (t.situacion || '') + ' ' +
          (t.observaciones || '') + ' ' +
          (t.evaluador || '') + ' ' +
          (t.uo || '') + ' ' +
          (t.proceso || '') + ' ' +
          (t.id || '')
        ).toLowerCase();
        if (!matchText.includes(query)) return false;
      }

      return true;
    });
  }, [tasks, search, filterUO, filterProceso, filterResponsable, filterEstado]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const getStatusBadge = (estado: TaskStatus) => {
    switch (estado) {
      case 'CUMPLIDA A TIEMPO':
        return {
          bg: '#ECFDF5',
          color: '#065F46',
          border: '#A7F3D0',
          label: 'Cumplida a Tiempo'
        };
      case 'CUMPLIDA CON ATRASO':
        return {
          bg: '#FFFBEB',
          color: '#92400E',
          border: '#FDE68A',
          label: 'Cumplida c/ Atraso'
        };
      case 'PENDIENTE':
        return {
          bg: '#EFF6FF',
          color: '#1E40AF',
          border: '#BFDBFE',
          label: 'Pendiente Vigente'
        };
      case 'NO CUMPLIDA':
        return {
          bg: '#FEF2F2',
          color: '#991B1B',
          border: '#FECACA',
          label: 'No Cumplida / Vencida'
        };
      case 'SIN FECHA COMPROMISO':
      default:
        return {
          bg: '#F1F5F9',
          color: '#475569',
          border: '#E2E8F0',
          label: 'Sin Fecha'
        };
    }
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* FILTER & SEARCH TOOLBAR */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 0.85rem',
            flex: '1 1 280px'
          }}>
            <Search size={18} color="#94A3B8" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Buscar en tareas, situaciones, observaciones, evaluador..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                fontSize: '0.85rem'
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter UO */}
          <select
            value={filterUO}
            onChange={(e) => { setFilterUO(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <option value="">Todas las UO</option>
            {catalogs.uos.map(uo => (
              <option key={uo} value={uo}>{uo}</option>
            ))}
          </select>

          {/* Filter Proceso */}
          <select
            value={filterProceso}
            onChange={(e) => { setFilterProceso(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <option value="">Todos los Procesos</option>
            {catalogs.procesos.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Filter Responsable */}
          <select
            value={filterResponsable}
            onChange={(e) => { setFilterResponsable(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <option value="">Todos los Responsables</option>
            {catalogs.responsables.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Filter Estado */}
          <select
            value={filterEstado}
            onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <option value="">Todos los Estados</option>
            {catalogs.estados.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>

          {(search || filterUO || filterProceso || filterResponsable || filterEstado) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterUO('');
                setFilterProceso('');
                setFilterResponsable('');
                setFilterEstado('');
                setCurrentPage(1);
              }}
              style={{
                fontSize: '0.8rem',
                color: 'var(--msm-accent)',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #F1F5F9',
          fontSize: '0.8rem',
          color: '#64748B'
        }}>
          <span>
            Mostrando <strong>{filteredTasks.length}</strong> tareas de {tasks.length} totales
          </span>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentPage <= 1 ? '#F1F5F9' : '#FFFFFF',
                color: currentPage <= 1 ? '#94A3B8' : '#334155'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentPage >= totalPages ? '#F1F5F9' : '#FFFFFF',
                color: currentPage >= totalPages ? '#94A3B8' : '#334155'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* DATA GRID TABLE */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--msm-navy)', color: '#FFFFFF' }}>
                <th style={{ padding: '0.8rem 1rem', width: '90px' }}>UO</th>
                <th style={{ padding: '0.8rem 1rem', width: '180px' }}>Proceso</th>
                <th style={{ padding: '0.8rem 1rem' }}>Tarea Asignada</th>
                <th style={{ padding: '0.8rem 1rem', width: '150px' }}>Responsable</th>
                <th style={{ padding: '0.8rem 1rem', width: '110px' }}>Compromiso</th>
                <th style={{ padding: '0.8rem 1rem', width: '110px' }}>Ejecución</th>
                <th style={{ padding: '0.8rem 1rem', width: '140px' }}>Estado</th>
                <th style={{ padding: '0.8rem 1rem', width: '110px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                    No se encontraron tareas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((t, index) => {
                  const badge = getStatusBadge(t.estado);
                  const isOverdue = t.estado === 'NO CUMPLIDA';
                  return (
                    <tr 
                      key={t.id} 
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                      }}
                    >
                      {/* UO */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                        <span style={{
                          backgroundColor: 'var(--msm-blue)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-block'
                        }}>
                          {t.uo}
                        </span>
                      </td>

                      {/* Proceso */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', fontWeight: 600, color: '#334155' }}>
                        {t.proceso}
                      </td>

                      {/* Tarea & Situacion */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                        <p style={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.35 }}>
                          {t.tarea}
                        </p>
                        {t.situacion && (
                          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', fontStyle: 'italic' }}>
                            Hallazgo: {t.situacion}
                          </p>
                        )}
                        {t.observaciones && (
                          <div style={{
                            marginTop: '0.35rem',
                            fontSize: '0.73rem',
                            backgroundColor: '#F1F5F9',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            color: '#475569'
                          }}>
                            <strong>Avance:</strong> {t.observaciones}
                          </div>
                        )}
                      </td>

                      {/* Responsable */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', color: '#475569' }}>
                        {t.responsable}
                      </td>

                      {/* Fecha Compromiso */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', fontWeight: 600, color: isOverdue ? '#DC2626' : '#334155' }}>
                        {t.fechaCompromiso || <span style={{ color: '#94A3B8' }}>Sin fecha</span>}
                        {isOverdue && t.retrasoDias ? (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#DC2626', fontWeight: 700 }}>
                            +{t.retrasoDias}d mora
                          </span>
                        ) : null}
                      </td>

                      {/* Fecha Ejecución */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                        {t.fechaEjecucion ? (
                          <span style={{ color: '#047857', fontWeight: 600 }}>{t.fechaEjecucion}</span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          {!t.fechaEjecucion && (
                            <button
                              onClick={() => onCompleteTask(t)}
                              style={{
                                backgroundColor: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                padding: '0.3rem',
                                borderRadius: 'var(--radius-sm)'
                              }}
                              title="Marcar como cumplida"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => onEditTask(t)}
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                              padding: '0.3rem',
                              borderRadius: 'var(--radius-sm)'
                            }}
                            title="Editar tarea"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar esta tarea de seguimiento?')) {
                                onDeleteTask(t.id);
                              }
                            }}
                            style={{
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              padding: '0.3rem',
                              borderRadius: 'var(--radius-sm)'
                            }}
                            title="Eliminar tarea"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
