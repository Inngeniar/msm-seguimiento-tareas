import React from 'react';
import logoImg from '../assets/logo.png';
import { 
  LayoutDashboard, 
  CheckSquare, 
  PlusCircle, 
  Building2, 
  Briefcase, 
  Download, 
  RotateCcw,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Catalogs, UserRole } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'tasks' | 'new-task' | 'uo-summary' | 'process-summary';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'new-task' | 'uo-summary' | 'process-summary') => void;
  selectedUO: string;
  setSelectedUO: (uo: string) => void;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  catalogs: Catalogs;
  onExportExcel: () => void;
  onResetData: () => void;
  totalTasks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedUO,
  setSelectedUO,
  selectedRole,
  setSelectedRole,
  catalogs,
  onExportExcel,
  onResetData,
  totalTasks
}) => {
  return (
    <header style={{
      backgroundColor: 'var(--msm-navy)',
      color: '#FFFFFF',
      boxShadow: 'var(--shadow-md)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img 
            src={logoImg} 
            alt="Mundo Salud Médica" 
            style={{ 
              height: '42px', 
              objectFit: 'contain',
              backgroundColor: 'white',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                MUNDO SALUD MÉDICA
              </span>
              <span style={{ 
                fontSize: '0.7rem', 
                backgroundColor: 'rgba(2, 132, 199, 0.25)', 
                color: '#38BDF8', 
                padding: '0.15rem 0.5rem', 
                borderRadius: 'var(--radius-full)', 
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                SIG & CALIDAD
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
              Seguimiento a Tareas de Unidades Operativas (DOE-FT-001)
            </p>
          </div>
        </div>

        {/* Global Selectors: Unidad Operativa & Rol de Funcionario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* UO Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Building2 size={16} color="#38BDF8" style={{ marginRight: '0.4rem' }} />
            <span style={{ fontSize: '0.75rem', color: '#CBD5E1', marginRight: '0.4rem', fontWeight: 600 }}>
              Sede/UO:
            </span>
            <select
              value={selectedUO}
              onChange={(e) => setSelectedUO(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                outline: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <option value="" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Todas las UO (Global)</option>
              {catalogs.uos.map((uo) => (
                <option key={uo} value={uo} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                  {uo}
                </option>
              ))}
            </select>
          </div>

          {/* Role Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <UserCheck size={16} color="#34D399" style={{ marginRight: '0.4rem' }} />
            <span style={{ fontSize: '0.75rem', color: '#CBD5E1', marginRight: '0.4rem', fontWeight: 600 }}>
              Perfil:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: 'none',
                outline: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <option value="TODOS" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>Todos los Roles</option>
              {catalogs.responsables.map((resp) => (
                <option key={resp} value={resp} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                  {resp}
                </option>
              ))}
            </select>
          </div>

          {/* Actions: Export Excel & Reset */}
          <button
            onClick={onExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
            }}
            title="Descargar libro Excel actualizado con todas las fórmulas"
          >
            <Download size={15} />
            <span>Excel DOE-FT-001</span>
          </button>

          <button
            onClick={onResetData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#E2E8F0',
              padding: '0.45rem 0.7rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
            title="Restablecer datos originales"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        backgroundColor: 'var(--msm-blue)',
        overflowX: 'auto',
        gap: '0.5rem'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: <LayoutDashboard size={17} /> },
          { id: 'tasks', label: `Matriz de Tareas (${totalTasks})`, icon: <CheckSquare size={17} /> },
          { id: 'new-task', label: 'Registrar Nueva Tarea', icon: <PlusCircle size={17} /> },
          { id: 'uo-summary', label: 'Consolidado por UO', icon: <Building2 size={17} /> },
          { id: 'process-summary', label: 'Procesos de Facturación', icon: <Briefcase size={17} /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#CBD5E1',
                borderBottom: isActive ? '3px solid #38BDF8' : '3px solid transparent',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
