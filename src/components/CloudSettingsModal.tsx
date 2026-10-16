import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  X, 
  UploadCloud, 
  Key, 
  Globe, 
  Copy, 
  Check, 
  RefreshCw,
  AlertTriangle,
  Database
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  clearStoredSupabaseConfig, 
  testCloudConnection, 
  batchSyncTasksToCloud,
  SUPABASE_SQL_SETUP 
} from '../services/supabase';
import { Task } from '../types';

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onTasksUpdatedFromCloud: () => void;
}

export const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onTasksUpdatedFromCloud
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
      setUploadResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    saveStoredSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    setTesting(true);
    setTestResult(null);
    const res = await testCloudConnection();
    setTestResult(res);
    setTesting(false);
    if (res.success) {
      onTasksUpdatedFromCloud();
    }
  };

  const handleUploadAllToCloud = async () => {
    if (!confirm(`¿Deseas sincronizar y cargar las ${tasks.length} tareas actuales en la base de datos en la nube?`)) {
      return;
    }
    setUploading(true);
    setUploadResult(null);
    const res = await batchSyncTasksToCloud(tasks);
    if (res.success) {
      setUploadResult(`✓ Se sincronizaron exitosamente ${res.count} tareas a la Nube.`);
      onTasksUpdatedFromCloud();
    } else {
      setUploadResult(`Error al subir: ${res.error}`);
    }
    setUploading(false);
  };

  const handleDisconnect = () => {
    if (confirm('¿Deseas desconectar la nube y volver al modo Local (LocalStorage)?')) {
      clearStoredSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      onTasksUpdatedFromCloud();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(1, 28, 78, 0.65)',
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
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: 'var(--msm-navy)',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex'
            }}>
              <Cloud size={24} color="#38BDF8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Conexión en Tiempo Real a la Nube (Supabase)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: 0, marginTop: '2px' }}>
                Permite que todas las Unidades Operativas vean y actualicen las tareas de forma simultánea.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Explanation Banner */}
          <div style={{
            backgroundColor: 'var(--bg-light)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--msm-blue)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>¿Cómo funciona la colaboración en vivo?</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              Sin la nube, los cambios solo se guardan en tu navegador. Al conectar tu proyecto de <strong>Supabase</strong> (gratuito), cualquier persona en Vercel u otra sede que complete o modifique una tarea verá los cambios reflejados <strong>en vivo sin recargar la página</strong>.
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                <Globe size={16} color="var(--msm-blue)" />
                URL del Proyecto Supabase (Project URL)
              </label>
              <input
                type="text"
                placeholder="https://xyzabcdefghijklm.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                <Key size={16} color="var(--msm-blue)" />
                Clave Pública Anónima (Anon / Public API Key)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleTest}
              disabled={testing || !url || !anonKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--msm-blue)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: (testing || !url || !anonKey) ? 'not-allowed' : 'pointer',
                opacity: (testing || !url || !anonKey) ? 0.6 : 1
              }}
            >
              {testing ? <RefreshCw size={16} className="spin" /> : <CloudCheck size={16} />}
              <span>{testing ? 'Comprobando conexión...' : 'Guardar y Probar Conexión'}</span>
            </button>

            {url && anonKey && (
              <button
                onClick={handleDisconnect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <CloudOff size={16} />
                <span>Desconectar Nube</span>
              </button>
            )}
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: testResult.success ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${testResult.success ? '#6EE7B7' : '#FCA5A5'}`,
              color: testResult.success ? '#065F46' : '#991B1B',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                {testResult.success ? <Check size={18} color="#059669" /> : <AlertTriangle size={18} color="#DC2626" />}
                <span>{testResult.message}</span>
              </div>

              {testResult.success && (
                <div style={{ marginTop: '0.25rem' }}>
                  <button
                    onClick={handleUploadAllToCloud}
                    disabled={uploading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? <RefreshCw size={14} className="spin" /> : <UploadCloud size={16} />}
                    <span>{uploading ? 'Sincronizando tareas a Supabase...' : `Subir las ${tasks.length} tareas del Excel a la Nube`}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {uploadResult && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#EFF6FF',
              border: '1px solid #93C5FD',
              color: '#1E40AF',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              {uploadResult}
            </div>
          )}

          {/* SQL Setup Instruction Dropdown */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setShowSql(!showSql)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} color="var(--msm-navy)" />
                <span>Script SQL de Creación de Tabla en Supabase (1 Clic)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--msm-blue)' }}>
                {showSql ? 'Ocultar ▲' : 'Ver / Copiar SQL ▼'}
              </span>
            </button>

            {showSql && (
              <div style={{ padding: '1rem', backgroundColor: '#0F172A', color: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Copia y pega este código en el "SQL Editor" de tu proyecto en Supabase:
                  </span>
                  <button
                    onClick={handleCopySql}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: copiedSql ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
                <pre style={{
                  fontSize: '0.75rem',
                  lineHeight: '1.4',
                  margin: 0,
                  overflowX: 'auto',
                  fontFamily: 'Consolas, monospace',
                  color: '#38BDF8'
                }}>
                  {SUPABASE_SQL_SETUP}
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#F8FAFC'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
