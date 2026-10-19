import React, { useState, useEffect, useMemo } from 'react';
import './styles/theme.css';
import { 
  loadTasks, 
  saveTasks, 
  addTask, 
  updateTask, 
  completeTask, 
  deleteTask, 
  resetToInitial, 
  calculateKPIs, 
  loadCatalogs,
  resetCatalogs,
  addUOToCatalogs,
  removeUOFromCatalogs,
  addEvaluadorToCatalogs,
  removeEvaluadorFromCatalogs,
  addProcesoToCatalogs,
  removeProcesoFromCatalogs,
  recalculateTaskStatus
} from './services/storage';
import { 
  fetchCloudTasks, 
  upsertCloudTask, 
  deleteCloudTask, 
  subscribeToCloudChanges, 
  getStoredSupabaseConfig 
} from './services/supabase';
import { exportTasksToExcel } from './utils/excelExporter';
import { Task, UserRole, Catalogs } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { TaskFormModal } from './components/TaskFormModal';
import { CompleteTaskModal } from './components/CompleteTaskModal';
import { UOPerformanceView } from './components/UOPerformanceView';
import { ProcessMatrixView } from './components/ProcessMatrixView';
import { CloudSettingsModal } from './components/CloudSettingsModal';
import { ManageCatalogsModal } from './components/ManageCatalogsModal';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'new-task' | 'uo-summary' | 'process-summary'>('dashboard');
  const [selectedUO, setSelectedUO] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TODOS');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  // Modals state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Dynamic Catalogs state
  const [catalogs, setCatalogs] = useState<Catalogs>(() => loadCatalogs());
  const [isCatalogsModalOpen, setIsCatalogsModalOpen] = useState(false);

  // Sync / Load tasks from Cloud or Local
  const loadData = async () => {
    const cfg = getStoredSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      const cloudTasks = await fetchCloudTasks();
      if (cloudTasks && cloudTasks.length > 0) {
        const processed = cloudTasks.map(recalculateTaskStatus);
        setTasks(processed);
        saveTasks(processed); // mirror locally for offline backup
        setIsCloudConnected(true);
        return;
      }
      setIsCloudConnected(true);
    } else {
      setIsCloudConnected(false);
    }

    // Local fallback
    const loaded = loadTasks();
    setTasks(loaded);
  };

  // Load initial tasks on mount and setup real-time subscription
  useEffect(() => {
    loadData();

    // Subscribe to cloud database changes in real-time
    const unsubscribe = subscribeToCloudChanges(() => {
      fetchCloudTasks().then((cloudTasks) => {
        if (cloudTasks && cloudTasks.length > 0) {
          const processed = cloudTasks.map(recalculateTaskStatus);
          setTasks(processed);
          saveTasks(processed);
          showNotification('🔄 Datos actualizados en tiempo real desde otra sede.');
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Extract distinct years from tasks
  const availableYears = useMemo(() => {
    const yrs = new Set<string>();
    tasks.forEach(t => {
      const d = t.fechaCompromiso || t.fechaEvaluacion;
      if (d && d.length >= 4) {
        const yr = d.slice(0, 4);
        if (/^\d{4}$/.test(yr)) yrs.add(yr);
      }
    });
    return Array.from(yrs).sort().reverse();
  }, [tasks]);

  // Filter tasks by selected UO, Role, Year, and Month for Dashboard and Views
  const scopedTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedUO && t.uo !== selectedUO) return false;
      if (selectedRole !== 'TODOS' && t.responsable !== selectedRole) return false;
      if (selectedYear) {
        const d = t.fechaCompromiso || t.fechaEvaluacion;
        if (!d || !d.startsWith(selectedYear)) return false;
      }
      if (selectedMonth) {
        const d = t.fechaCompromiso || t.fechaEvaluacion;
        if (!d) return false;
        const parts = d.split('-');
        if (parts.length < 2 || parts[1] !== selectedMonth) return false;
      }
      return true;
    });
  }, [tasks, selectedUO, selectedRole, selectedYear, selectedMonth]);

  // Compute live KPIs
  const kpis = useMemo(() => calculateKPIs(scopedTasks), [scopedTasks]);

  // Handlers with dual Local + Cloud sync
  const handleSaveTask = async (taskData: any) => {
    let targetTask: Task;
    if (editingTask) {
      const updated = updateTask(taskData);
      targetTask = updated.find(t => t.id === taskData.id) || taskData;
      setTasks(updated);
      showNotification('✓ Tarea actualizada exitosamente.');
    } else {
      const updated = addTask(taskData);
      targetTask = updated[0];
      setTasks(updated);
      showNotification('✓ Nueva tarea registrada en la matriz.');
    }

    if (isCloudConnected && targetTask) {
      await upsertCloudTask(targetTask);
    }
    setEditingTask(null);
  };

  const handleConfirmComplete = async (taskId: string, fechaEjecucion: string, observaciones: string) => {
    const updated = completeTask(taskId, fechaEjecucion, observaciones);
    setTasks(updated);
    showNotification('✓ Tarea marcada como cumplida.');
    
    if (isCloudConnected) {
      const completed = updated.find(t => t.id === taskId);
      if (completed) {
        await upsertCloudTask(completed);
      }
    }
    setCompletingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updated = deleteTask(taskId);
    setTasks(updated);
    showNotification('✓ Tarea eliminada del seguimiento.');

    if (isCloudConnected) {
      await deleteCloudTask(taskId);
    }
  };

  const handleExportExcel = () => {
    exportTasksToExcel(tasks);
    showNotification('✓ Archivo Excel generado y descargado.');
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer los datos originales del archivo Excel? Los cambios manuales no guardados en Excel se reiniciarán.')) {
      const reset = resetToInitial();
      setTasks(reset);
      showNotification('✓ Datos restablecidos a la versión base oficial.');
    }
  };

  // Dynamic Catalog handlers
  const handleAddUO = (name: string) => {
    const updated = addUOToCatalogs(name);
    setCatalogs(updated);
    showNotification(`✓ Sede ${name} agregada al catálogo.`);
  };

  const handleRemoveUO = (name: string) => {
    const updated = removeUOFromCatalogs(name);
    setCatalogs(updated);
    showNotification(`✓ Sede ${name} removida del catálogo.`);
  };

  const handleAddEvaluador = (name: string) => {
    const updated = addEvaluadorToCatalogs(name);
    setCatalogs(updated);
    showNotification(`✓ Evaluador ${name} agregado al catálogo.`);
  };

  const handleRemoveEvaluador = (name: string) => {
    const updated = removeEvaluadorFromCatalogs(name);
    setCatalogs(updated);
    showNotification(`✓ Evaluador ${name} removido del catálogo.`);
  };

  const handleAddProceso = (name: string) => {
    const updated = addProcesoToCatalogs(name);
    setCatalogs(updated);
    showNotification(`✓ Proceso ${name} agregado al catálogo.`);
  };

  const handleRemoveProceso = (name: string) => {
    const updated = removeProcesoFromCatalogs(name);
    setCatalogs(updated);
    showNotification(`✓ Proceso ${name} removido del catálogo.`);
  };

  const handleResetCatalogs = () => {
    const updated = resetCatalogs();
    setCatalogs(updated);
    showNotification('✓ Catálogos restaurados a valores oficiales por defecto.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--msm-navy)',
          color: '#FFFFFF',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 600,
          borderLeft: '4px solid #10B981',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification}
        </div>
      )}

      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'new-task') {
            setEditingTask(null);
            setIsFormModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        selectedUO={selectedUO}
        setSelectedUO={setSelectedUO}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableYears={availableYears}
        catalogs={catalogs}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        totalTasks={scopedTasks.length}
        isCloudConnected={isCloudConnected}
        onOpenCloudSettings={() => setIsCloudModalOpen(true)}
        onOpenManageCatalogs={() => setIsCatalogsModalOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={scopedTasks}
            allTasks={tasks}
            kpis={kpis}
            selectedUO={selectedUO}
            setSelectedUO={setSelectedUO}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onSelectTask={(task) => {
              setEditingTask(task);
              setIsFormModalOpen(true);
            }}
            onQuickComplete={(taskId) => {
              const target = tasks.find(t => t.id === taskId);
              if (target) {
                setCompletingTask(target);
                setIsCompleteModalOpen(true);
              }
            }}
            onViewAllTasks={() => setActiveTab('tasks')}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskListView
            tasks={tasks}
            catalogs={catalogs}
            selectedUO={selectedUO}
            setSelectedUO={setSelectedUO}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsFormModalOpen(true);
            }}
            onCompleteTask={(task) => {
              setCompletingTask(task);
              setIsCompleteModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'uo-summary' && (
          <UOPerformanceView
            tasks={tasks}
            catalogs={catalogs}
            onFilterUO={(uo) => {
              setSelectedUO(uo);
              setActiveTab('tasks');
            }}
          />
        )}

        {activeTab === 'process-summary' && (
          <ProcessMatrixView
            tasks={tasks}
            catalogs={catalogs}
            onFilterProcess={(proceso) => {
              setActiveTab('tasks');
            }}
          />
        )}
      </main>

      {/* Task Form Modal (Create / Edit) */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        catalogs={catalogs}
        defaultUO={selectedUO}
      />

      {/* Quick Complete Modal */}
      <CompleteTaskModal
        task={completingTask}
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setCompletingTask(null);
        }}
        onConfirm={handleConfirmComplete}
      />

      {/* Cloud Settings & Sync Modal */}
      <CloudSettingsModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        tasks={tasks}
        onTasksUpdatedFromCloud={loadData}
      />

      {/* Manage Catalogs Modal (Dynamic UOs, Evaluadores, Procesos) */}
      <ManageCatalogsModal
        isOpen={isCatalogsModalOpen}
        onClose={() => setIsCatalogsModalOpen(false)}
        catalogs={catalogs}
        tasks={tasks}
        onAddUO={handleAddUO}
        onRemoveUO={handleRemoveUO}
        onAddEvaluador={handleAddEvaluador}
        onRemoveEvaluador={handleRemoveEvaluador}
        onAddProceso={handleAddProceso}
        onRemoveProceso={handleRemoveProceso}
        onResetCatalogs={handleResetCatalogs}
      />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: '#64748B',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ color: 'var(--msm-navy)' }}>MUNDO SALUD MÉDICA S.A.S.</strong>
          <span>• Dirección de Operaciones & Sistema Integrado de Gestión</span>
        </div>
        <div>
          Formato DOE-FT-001 (Versión 04) • Herramienta Interactiva de Seguimiento a Tareas
        </div>
      </footer>
    </div>
  );
};

export default App;
