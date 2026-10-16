import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { Task } from '../types';

interface CompleteTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, fechaEjecucion: string, observaciones: string) => void;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !task) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [fechaEjecucion, setFechaEjecucion] = useState(todayStr);
  const [observaciones, setObservaciones] = useState(task.observaciones || '');

  const isLate = task.fechaCompromiso && fechaEjecucion > task.fechaCompromiso;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(task.id, fechaEjecucion, observaciones);
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
        maxWidth: '540px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#047857',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={22} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Marcar Tarea como Cumplida</h3>
              <p style={{ fontSize: '0.75rem', color: '#D1FAE5' }}>{task.uo} • {task.proceso}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#FFFFFF' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Task Summary Box */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.35 }}>
              {task.tarea}
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748B', marginTop: '0.4rem' }}>
              <span>Compromiso: <strong>{task.fechaCompromiso || 'Sin fecha'}</strong></span>
              <span>Responsable: <strong>{task.responsable}</strong></span>
            </div>
          </div>

          {/* Fecha Ejecución */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Fecha Real de Ejecución / Cumplimiento *
            </label>
            <input
              type="date"
              value={fechaEjecucion}
              onChange={(e) => setFechaEjecucion(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontWeight: 600
              }}
            />
            {isLate ? (
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#B45309', fontWeight: 600, marginTop: '0.25rem' }}>
                ⚠️ Se registrará como <strong>CUMPLIDA CON ATRASO</strong> (superó la fecha límite).
              </span>
            ) : (
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
                ✓ Se registrará como <strong>CUMPLIDA A TIEMPO (SLA cumplido)</strong>.
              </span>
            )}
          </div>

          {/* Observaciones / Soportes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Observaciones de Cierre y Soportes de Evidencia
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Indique cómo se dio cumplimiento a la tarea, soportes generados, radicado, correo de soporte, etc."
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

          {/* Actions */}
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
                gap: '0.4rem',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Confirmar Cumplimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
