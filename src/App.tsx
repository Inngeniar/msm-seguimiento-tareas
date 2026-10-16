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
  getCatalogs 
} from './services/storage';
import { exportTasksToExcel } from './utils/excelExporter';
import { Task, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { TaskFormModal } from './components/TaskFormModal';
import { CompleteTaskModal } from './components/CompleteTaskModal';
import { UOPerformanceView } from './components/UOPerformanceView';
import { ProcessMatrixView } from './components/ProcessMatrixView';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'new-task' | 'uo-summary' | 'process-summary'>('dashboard');
  const [selectedUO, setSelectedUO] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TODOS');
  
  // Modals state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const catalogs = useMemo(() => getCatalogs(), []);

  // Load initial tasks on mount
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter tasks by selected UO and Role for Dashboard and Views
  const scopedTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedUO && t.uo !== selectedUO) return false;
      if (selectedRole !== 'TODOS' && t.responsable !== selectedRole) return false;
      return true;
    });
  }, [tasks, selectedUO, selectedRole]);

  // Compute live KPIs
  const kpis = useMemo(() => calculateKPIs(scopedTasks), [scopedTasks]);

  // Handlers
  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      const updated = updateTask(taskData);
      setTasks(updated);
      showNotification('✓ Tarea actualizada exitosamente.');
    } else {
      const updated = addTask(taskData);
      setTasks(updated);
      showNotification('✓ Nueva tarea registrada en la matriz.');
    }
    setEditingTask(null);
  };

  const handleConfirmComplete = (taskId: string, fechaEjecucion: string, observaciones: string) => {
    const updated = completeTask(taskId, fechaEjecucion, observaciones);
    setTasks(updated);
    showNotification('✓ Tarea marcada como cumplida.');
    setCompletingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = deleteTask(taskId);
    setTasks(updated);
    showNotification('✓ Tarea eliminada del seguimiento.');
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
        catalogs={catalogs}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        totalTasks={scopedTasks.length}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={scopedTasks}
            kpis={kpis}
            selectedUO={selectedUO}
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
            tasks={scopedTasks}
            catalogs={catalogs}
            selectedUO={selectedUO}
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
