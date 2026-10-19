import React, { useState, useMemo } from 'react';
import { 
  X, 
  Building2, 
  UserCheck, 
  Briefcase, 
  Plus, 
  Trash2, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  Layers
} from 'lucide-react';
import { Catalogs, Task } from '../types';

interface ManageCatalogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogs: Catalogs;
  tasks: Task[];
  onAddUO: (name: string) => void;
  onRemoveUO: (name: string) => void;
  onAddEvaluador: (name: string) => void;
  onRemoveEvaluador: (name: string) => void;
  onAddProceso: (name: string) => void;
  onRemoveProceso: (name: string) => void;
  onResetCatalogs: () => void;
}

type TabType = 'uos' | 'evaluadores' | 'procesos';

export const ManageCatalogsModal: React.FC<ManageCatalogsModalProps> = ({
  isOpen,
  onClose,
  catalogs,
  tasks,
  onAddUO,
  onRemoveUO,
  onAddEvaluador,
  onRemoveEvaluador,
  onAddProceso,
  onRemoveProceso,
  onResetCatalogs
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('uos');
  const [newUO, setNewUO] = useState('');
  const [newEvaluador, setNewEvaluador] = useState('');
  const [newProceso, setNewProceso] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Compute tasks count per item
  const uoTaskCounts = useMemo(() => {
    const map: Record<string, number> = {};
    catalogs.uos.forEach(uo => { map[uo] = 0; });
    tasks.forEach(t => {
      if (t.uo) map[t.uo] = (map[t.uo] || 0) + 1;
    });
    return map;
  }, [catalogs.uos, tasks]);

  const evaluadorTaskCounts = useMemo(() => {
    const map: Record<string, number> = {};
    catalogs.evaluadores.forEach(ev => { map[ev] = 0; });
    tasks.forEach(t => {
      if (t.evaluador) map[t.evaluador] = (map[t.evaluador] || 0) + 1;
    });
    return map;
  }, [catalogs.evaluadores, tasks]);

  const procesoTaskCounts = useMemo(() => {
    const map: Record<string, number> = {};
    catalogs.procesos.forEach(p => { map[p] = 0; });
    tasks.forEach(t => {
      if (t.proceso) map[t.proceso] = (map[t.proceso] || 0) + 1;
    });
    return map;
  }, [catalogs.procesos, tasks]);

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Handlers
  const handleAddUO = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newUO.trim().toUpperCase();
    if (!clean) {
      showFeedback('Escribe el nombre o sigla de la Unidad Operativa.', 'error');
      return;
    }
    if (catalogs.uos.includes(clean)) {
      showFeedback(`La Unidad Operativa "${clean}" ya existe en el catálogo.`, 'error');
      return;
    }
    onAddUO(clean);
    setNewUO('');
    showFeedback(`Unidad Operativa "${clean}" agregada exitosamente.`, 'success');
  };

  const handleRemoveUO = (uo: string) => {
    const count = uoTaskCounts[uo] || 0;
    if (count > 0) {
      const ok = confirm(`⚠️ La Unidad Operativa "${uo}" tiene ${count} tareas registradas actualmente. Si la eliminas del catálogo, las tareas existentes conservarán su valor pero la sede no aparecerá para nuevas tareas o filtros. ¿Deseas eliminarla?`);
      if (!ok) return;
    } else {
      const ok = confirm(`¿Estás seguro de eliminar la Unidad Operativa "${uo}" del catálogo?`);
      if (!ok) return;
    }
    onRemoveUO(uo);
    showFeedback(`Unidad Operativa "${uo}" eliminada del catálogo.`, 'success');
  };

  const handleAddEvaluador = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEvaluador.trim().toUpperCase();
    if (!clean) {
      showFeedback('Escribe el nombre del Evaluador.', 'error');
      return;
    }
    if (catalogs.evaluadores.includes(clean)) {
      showFeedback(`El evaluador "${clean}" ya existe en el catálogo.`, 'error');
      return;
    }
    onAddEvaluador(clean);
    setNewEvaluador('');
    showFeedback(`Evaluador "${clean}" agregado exitosamente.`, 'success');
  };

  const handleRemoveEvaluador = (ev: string) => {
    const count = evaluadorTaskCounts[ev] || 0;
    if (count > 0) {
      const ok = confirm(`⚠️ El Evaluador "${ev}" ha registrado ${count} evaluaciones. Si lo eliminas, las tareas existentes conservarán su registro. ¿Deseas eliminarlo del catálogo?`);
      if (!ok) return;
    } else {
      const ok = confirm(`¿Estás seguro de eliminar al evaluador "${ev}" del catálogo?`);
      if (!ok) return;
    }
    onRemoveEvaluador(ev);
    showFeedback(`Evaluador "${ev}" eliminado del catálogo.`, 'success');
  };

  const handleAddProceso = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newProceso.trim().toUpperCase();
    if (!clean) {
      showFeedback('Escribe el nombre del Proceso.', 'error');
      return;
    }
    if (catalogs.procesos.includes(clean)) {
      showFeedback(`El proceso "${clean}" ya existe en el catálogo.`, 'error');
      return;
    }
    onAddProceso(clean);
    setNewProceso('');
    showFeedback(`Proceso "${clean}" agregado exitosamente.`, 'success');
  };

  const handleRemoveProceso = (p: string) => {
    const count = procesoTaskCounts[p] || 0;
    if (count > 0) {
      const ok = confirm(`⚠️ El Proceso "${p}" tiene ${count} tareas vinculadas. ¿Deseas eliminarlo del catálogo?`);
      if (!ok) return;
    } else {
      const ok = confirm(`¿Estás seguro de eliminar el proceso "${p}" del catálogo?`);
      if (!ok) return;
    }
    onRemoveProceso(p);
    showFeedback(`Proceso "${p}" eliminado del catálogo.`, 'success');
  };

  const handleReset = () => {
    const ok = confirm('¿Restablecer todos los catálogos (UOs, Evaluadores y Procesos) a los valores oficiales por defecto?');
    if (ok) {
      onResetCatalogs();
      showFeedback('Catálogos restaurados a los valores por defecto.', 'success');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E2E8F0',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--msm-navy)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Layers size={22} color="#38BDF8" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Administración Dinámica de Catálogos
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Agrega o remueve Unidades Operativas (Sedes), Evaluadores y Procesos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: feedbackMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: feedbackMsg.type === 'success' ? '#065F46' : '#991B1B',
            borderBottom: `1px solid ${feedbackMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            {feedbackMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          padding: '0 1rem'
        }}>
          <button
            onClick={() => setActiveTab('uos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'uos' ? 700 : 500,
              color: activeTab === 'uos' ? 'var(--msm-navy)' : '#64748B',
              borderBottom: activeTab === 'uos' ? '3px solid var(--msm-navy)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            <Building2 size={16} color={activeTab === 'uos' ? '#0284C7' : '#94A3B8'} />
            <span>Unidades Operativas (Sedes)</span>
            <span style={{
              backgroundColor: activeTab === 'uos' ? 'var(--msm-navy)' : '#E2E8F0',
              color: activeTab === 'uos' ? '#FFFFFF' : '#475569',
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}>
              {catalogs.uos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evaluadores')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'evaluadores' ? 700 : 500,
              color: activeTab === 'evaluadores' ? 'var(--msm-navy)' : '#64748B',
              borderBottom: activeTab === 'evaluadores' ? '3px solid var(--msm-navy)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            <UserCheck size={16} color={activeTab === 'evaluadores' ? '#10B981' : '#94A3B8'} />
            <span>Evaluadores</span>
            <span style={{
              backgroundColor: activeTab === 'evaluadores' ? 'var(--msm-navy)' : '#E2E8F0',
              color: activeTab === 'evaluadores' ? '#FFFFFF' : '#475569',
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}>
              {catalogs.evaluadores.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('procesos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'procesos' ? 700 : 500,
              color: activeTab === 'procesos' ? 'var(--msm-navy)' : '#64748B',
              borderBottom: activeTab === 'procesos' ? '3px solid var(--msm-navy)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={16} color={activeTab === 'procesos' ? '#F59E0B' : '#94A3B8'} />
            <span>Procesos</span>
            <span style={{
              backgroundColor: activeTab === 'procesos' ? 'var(--msm-navy)' : '#E2E8F0',
              color: activeTab === 'procesos' ? '#FFFFFF' : '#475569',
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}>
              {catalogs.procesos.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: UNIDADES OPERATIVAS */}
          {activeTab === 'uos' && (
            <div>
              <form onSubmit={handleAddUO} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  value={newUO}
                  onChange={(e) => setNewUO(e.target.value)}
                  placeholder="Ej: NUEVA-CLINICA-MEDELLIN o SEDE-NORTE"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'var(--msm-navy)',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  <span>Agregar Sede</span>
                </button>
              </form>

              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  backgroundColor: '#F1F5F9',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569'
                }}>
                  <span>UNIDAD OPERATIVA / SEDE ({catalogs.uos.length})</span>
                  <span>TAREAS ASOCIADAS Y ACCIÓN</span>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {catalogs.uos.map((uo) => {
                    const count = uoTaskCounts[uo] || 0;
                    return (
                      <div
                        key={uo}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 1rem',
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.82rem'
                          }}>
                            {uo}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: count > 0 ? '#475569' : '#94A3B8',
                            fontWeight: count > 0 ? 600 : 400
                          }}>
                            {count} {count === 1 ? 'tarea' : 'tareas'}
                          </span>
                          <button
                            onClick={() => handleRemoveUO(uo)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              padding: '0.35rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                            title={`Eliminar ${uo} del catálogo`}
                          >
                            <Trash2 size={13} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVALUADORES */}
          {activeTab === 'evaluadores' && (
            <div>
              <form onSubmit={handleAddEvaluador} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  value={newEvaluador}
                  onChange={(e) => setNewEvaluador(e.target.value)}
                  placeholder="Ej: MARÍA CAMILA RESTREPO"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  <span>Agregar Evaluador</span>
                </button>
              </form>

              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  backgroundColor: '#F1F5F9',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569'
                }}>
                  <span>NOMBRE DEL EVALUADOR ({catalogs.evaluadores.length})</span>
                  <span>EVALUACIONES REALIZADAS Y ACCIÓN</span>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {catalogs.evaluadores.map((ev) => {
                    const count = evaluadorTaskCounts[ev] || 0;
                    return (
                      <div
                        key={ev}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 1rem',
                          borderBottom: '1px solid #F1F5F9'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <UserCheck size={16} color="#059669" />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1E293B' }}>
                            {ev}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: count > 0 ? '#475569' : '#94A3B8',
                            fontWeight: count > 0 ? 600 : 400
                          }}>
                            {count} {count === 1 ? 'evaluación' : 'evaluaciones'}
                          </span>
                          <button
                            onClick={() => handleRemoveEvaluador(ev)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              padding: '0.35rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                            title={`Eliminar ${ev} del catálogo`}
                          >
                            <Trash2 size={13} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCESOS */}
          {activeTab === 'procesos' && (
            <div>
              <form onSubmit={handleAddProceso} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  value={newProceso}
                  onChange={(e) => setNewProceso(e.target.value)}
                  placeholder="Ej: FACTURACIÓN ELECTRONICA o CARTERA"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  <span>Agregar Proceso</span>
                </button>
              </form>

              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  backgroundColor: '#F1F5F9',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569'
                }}>
                  <span>NOMBRE DEL PROCESO MISIONAL ({catalogs.procesos.length})</span>
                  <span>TAREAS Y ACCIÓN</span>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {catalogs.procesos.map((p) => {
                    const count = procesoTaskCounts[p] || 0;
                    return (
                      <div
                        key={p}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 1rem',
                          borderBottom: '1px solid #F1F5F9'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Briefcase size={15} color="#D97706" />
                          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1E293B' }}>
                            {p}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: count > 0 ? '#475569' : '#94A3B8',
                            fontWeight: count > 0 ? 600 : 400
                          }}>
                            {count} {count === 1 ? 'tarea' : 'tareas'}
                          </span>
                          <button
                            onClick={() => handleRemoveProceso(p)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              padding: '0.35rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                            title={`Eliminar ${p} del catálogo`}
                          >
                            <Trash2 size={13} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
        }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'transparent',
              color: '#64748B',
              border: '1px solid #CBD5E1',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Restablece los catálogos a la lista oficial original"
          >
            <RotateCcw size={14} />
            <span>Restaurar Catálogos por Defecto</span>
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--msm-navy)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
