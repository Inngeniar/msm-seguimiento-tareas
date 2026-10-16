import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { Task, Catalogs } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  initialTask?: Task | null;
  catalogs: Catalogs;
  defaultUO?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  catalogs,
  defaultUO
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    uo: defaultUO || catalogs.uos[0] || 'RSA',
    proceso: catalogs.procesos[0] || 'LIQUIDACIÓN FACTURAS',
    evaluador: catalogs.evaluadores[0] || 'LEIDY JOHANNA MUÑOZ',
    situacion: '',
    tarea: '',
    responsable: catalogs.responsables[0] || 'LÍDER DE PROCESO',
    fechaEvaluacion: todayStr,
    fechaAsignacion: todayStr,
    fechaCompromiso: '',
    fechaEjecucion: '',
    observaciones: '',
    resultadosCifras: ''
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        uo: initialTask.uo,
        proceso: initialTask.proceso,
        evaluador: initialTask.evaluador || '',
        situacion: initialTask.situacion || '',
        tarea: initialTask.tarea || '',
        responsable: initialTask.responsable || 'LÍDER DE PROCESO',
        fechaEvaluacion: initialTask.fechaEvaluacion || todayStr,
        fechaAsignacion: initialTask.fechaAsignacion || todayStr,
        fechaCompromiso: initialTask.fechaCompromiso || '',
        fechaEjecucion: initialTask.fechaEjecucion || '',
        observaciones: initialTask.observaciones || '',
        resultadosCifras: initialTask.resultadosCifras || ''
      });
    } else {
      setFormData({
        uo: defaultUO || catalogs.uos[0] || 'RSA',
        proceso: catalogs.procesos[0] || 'LIQUIDACIÓN FACTURAS',
        evaluador: catalogs.evaluadores[0] || 'LEIDY JOHANNA MUÑOZ',
        situacion: '',
        tarea: '',
        responsable: catalogs.responsables[0] || 'LÍDER DE PROCESO',
        fechaEvaluacion: todayStr,
        fechaAsignacion: todayStr,
        fechaCompromiso: '',
        fechaEjecucion: '',
        observaciones: '',
        resultadosCifras: ''
      });
    }
  }, [initialTask, isOpen, defaultUO, catalogs]);

  if (!isOpen) return null;

  // Calculate live SLA days
  let slaDays = 0;
  if (formData.fechaAsignacion && formData.fechaCompromiso) {
    const d1 = new Date(formData.fechaAsignacion).getTime();
    const d2 = new Date(formData.fechaCompromiso).getTime();
    slaDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tarea.trim()) {
      alert('La descripción de la tarea asignada es obligatoria.');
      return;
    }
    onSave(initialTask ? { ...initialTask, ...formData } : formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(1, 28, 78, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--msm-navy)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {initialTask ? 'Editar Tarea de Seguimiento' : 'Registrar Nueva Tarea / Hallazgo'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
              Formato Oficial de Calidad DOE-FT-001
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#FFFFFF' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* UO */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Unidad Operativa (UO) *
              </label>
              <select
                value={formData.uo}
                onChange={(e) => setFormData({ ...formData, uo: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600
                }}
              >
                {catalogs.uos.map(uo => (
                  <option key={uo} value={uo}>{uo}</option>
                ))}
              </select>
            </div>

            {/* Proceso */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Proceso Evaluado *
              </label>
              <select
                value={formData.proceso}
                onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {catalogs.procesos.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Evaluador */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Evaluador / Auditor
              </label>
              <select
                value={formData.evaluador}
                onChange={(e) => setFormData({ ...formData, evaluador: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {catalogs.evaluadores.map(ev => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
            </div>

            {/* Responsable */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Responsable (Cargo) *
              </label>
              <select
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {catalogs.responsables.map(resp => (
                  <option key={resp} value={resp}>{resp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            border: '1px solid #E2E8F0'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Fecha Evaluación
              </label>
              <input
                type="date"
                value={formData.fechaEvaluacion}
                onChange={(e) => setFormData({ ...formData, fechaEvaluacion: e.target.value, fechaAsignacion: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Fecha Asignación
              </label>
              <input
                type="date"
                value={formData.fechaAsignacion}
                onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Fecha Compromiso (Límite)
              </label>
              <input
                type="date"
                value={formData.fechaCompromiso}
                onChange={(e) => setFormData({ ...formData, fechaCompromiso: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1'
                }}
              />
              {formData.fechaCompromiso && (
                <span style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  color: slaDays < 0 ? '#DC2626' : '#059669',
                  fontWeight: 600,
                  marginTop: '0.25rem'
                }}>
                  {slaDays < 0 ? `Fecha inválida (${slaDays} días)` : `Plazo SLA: ${slaDays} días`}
                </span>
              )}
            </div>
          </div>

          {/* Tarea & Situacion */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Tarea Asignada (Concisa y accionable) *
            </label>
            <textarea
              rows={3}
              value={formData.tarea}
              onChange={(e) => setFormData({ ...formData, tarea: e.target.value })}
              placeholder="Describa puntualmente la acción acordada a ejecutar..."
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Situación Encontrada / Hallazgo de Auditoría
            </label>
            <textarea
              rows={2}
              value={formData.situacion}
              onChange={(e) => setFormData({ ...formData, situacion: e.target.value })}
              placeholder="Describa el hallazgo u oportunidad identificada durante la evaluación..."
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Ejecución & Observaciones */}
          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            border: '1px solid #E2E8F0'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--msm-navy)', marginBottom: '0.75rem' }}>
              Registro de Ejecución / Cierre de Tarea
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  Fecha Ejecución (Si ya se cumplió)
                </label>
                <input
                  type="date"
                  value={formData.fechaEjecucion}
                  onChange={(e) => setFormData({ ...formData, fechaEjecucion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #CBD5E1'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  Resultados en Cifras (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: $18.500.000 conciliados, 478 encuestas"
                  value={formData.resultadosCifras}
                  onChange={(e) => setFormData({ ...formData, resultadosCifras: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #CBD5E1'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Observaciones de Cumplimiento / Soportes de Cierre
              </label>
              <textarea
                rows={2}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Detalle de las acciones realizadas, correos enviados, radicación, etc."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem'
                }}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--msm-navy)',
                color: '#FFFFFF',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Save size={16} />
              <span>Guardar Tarea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
