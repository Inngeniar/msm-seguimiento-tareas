import { Task, Catalogs, KPIStats } from '../types';
import initialTasksData from '../data/initialTasks.json';
import catalogsData from '../data/catalogs.json';

const STORAGE_KEY = 'msm_seguimiento_tareas_v2';
const CATALOGS_KEY = 'msm_catalogs_v2';

export const loadCatalogs = (): Catalogs => {
  try {
    const stored = localStorage.getItem(CATALOGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.uos) && Array.isArray(parsed.evaluadores)) {
        return parsed as Catalogs;
      }
    }
  } catch (err) {
    console.error('Error loading catalogs from localStorage', err);
  }
  return catalogsData as Catalogs;
};

export const saveCatalogs = (catalogs: Catalogs): void => {
  try {
    localStorage.setItem(CATALOGS_KEY, JSON.stringify(catalogs));
  } catch (err) {
    console.error('Error saving catalogs to localStorage', err);
  }
};

export const resetCatalogs = (): Catalogs => {
  const defaults = catalogsData as Catalogs;
  saveCatalogs(defaults);
  return defaults;
};

export const getCatalogs = (): Catalogs => {
  return loadCatalogs();
};

export const addUOToCatalogs = (uoName: string): Catalogs => {
  const current = loadCatalogs();
  const trimmed = uoName.trim().toUpperCase();
  if (!trimmed || current.uos.includes(trimmed)) return current;
  const updated: Catalogs = {
    ...current,
    uos: [...current.uos, trimmed].sort()
  };
  saveCatalogs(updated);
  return updated;
};

export const removeUOFromCatalogs = (uoName: string): Catalogs => {
  const current = loadCatalogs();
  const updated: Catalogs = {
    ...current,
    uos: current.uos.filter(u => u !== uoName)
  };
  saveCatalogs(updated);
  return updated;
};

export const addEvaluadorToCatalogs = (evaluadorName: string): Catalogs => {
  const current = loadCatalogs();
  const trimmed = evaluadorName.trim().toUpperCase();
  if (!trimmed || current.evaluadores.includes(trimmed)) return current;
  const updated: Catalogs = {
    ...current,
    evaluadores: [...current.evaluadores, trimmed].sort()
  };
  saveCatalogs(updated);
  return updated;
};

export const removeEvaluadorFromCatalogs = (evaluadorName: string): Catalogs => {
  const current = loadCatalogs();
  const updated: Catalogs = {
    ...current,
    evaluadores: current.evaluadores.filter(e => e !== evaluadorName)
  };
  saveCatalogs(updated);
  return updated;
};

export const addProcesoToCatalogs = (procesoName: string): Catalogs => {
  const current = loadCatalogs();
  const trimmed = procesoName.trim().toUpperCase();
  if (!trimmed || current.procesos.includes(trimmed)) return current;
  const updated: Catalogs = {
    ...current,
    procesos: [...current.procesos, trimmed].sort()
  };
  saveCatalogs(updated);
  return updated;
};

export const removeProcesoFromCatalogs = (procesoName: string): Catalogs => {
  const current = loadCatalogs();
  const updated: Catalogs = {
    ...current,
    procesos: current.procesos.filter(p => p !== procesoName)
  };
  saveCatalogs(updated);
  return updated;
};

export const recalculateTaskStatus = (task: Task): Task => {
  const todayStr = new Date().toISOString().split('T')[0];
  let estado = task.estado;
  let retrasoDias = 0;

  if (!task.fechaCompromiso) {
    estado = 'SIN FECHA COMPROMISO';
    retrasoDias = 0;
  } else if (task.fechaEjecucion) {
    if (task.fechaEjecucion <= task.fechaCompromiso) {
      estado = 'CUMPLIDA A TIEMPO';
      retrasoDias = 0;
    } else {
      estado = 'CUMPLIDA CON ATRASO';
      const fEjec = new Date(task.fechaEjecucion).getTime();
      const fComp = new Date(task.fechaCompromiso).getTime();
      retrasoDias = Math.max(0, Math.round((fEjec - fComp) / (1000 * 60 * 60 * 24)));
    }
  } else {
    if (todayStr <= task.fechaCompromiso) {
      estado = 'PENDIENTE';
      retrasoDias = 0;
    } else {
      estado = 'NO CUMPLIDA';
      const fToday = new Date(todayStr).getTime();
      const fComp = new Date(task.fechaCompromiso).getTime();
      retrasoDias = Math.max(0, Math.round((fToday - fComp) / (1000 * 60 * 60 * 24)));
    }
  }

  let diasCompromiso = 0;
  if (task.fechaAsignacion && task.fechaCompromiso) {
    const fAsig = new Date(task.fechaAsignacion).getTime();
    const fComp = new Date(task.fechaCompromiso).getTime();
    diasCompromiso = Math.max(0, Math.round((fComp - fAsig) / (1000 * 60 * 60 * 24)));
  }

  const avance = task.fechaEjecucion ? 1.0 : (estado === 'NO CUMPLIDA' ? 0.0 : 0.5);

  return {
    ...task,
    estado,
    retrasoDias,
    diasCompromiso,
    avance
  };
};

export const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: Task[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(recalculateTaskStatus);
      }
    }
  } catch (err) {
    console.error('Error loading tasks from localStorage', err);
  }

  // Fallback to initial seed data
  const initial = (initialTasksData as Task[]).map(recalculateTaskStatus);
  saveTasks(initial);
  return initial;
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage', err);
  }
};

export const addTask = (newTask: Omit<Task, 'id'> & { id?: string }): Task[] => {
  const current = loadTasks();
  let maxNum = current.length;
  current.forEach(t => {
    if (t.id) {
      const match = t.id.match(/^TASK-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });
  const id = newTask.id || `TASK-${String(maxNum + 1).padStart(4, '0')}`;
  const taskWithId: Task = recalculateTaskStatus({
    ...newTask,
    id,
    row: maxNum + 8
  });
  const updated = [taskWithId, ...current];
  saveTasks(updated);
  return updated;
};

export const updateTask = (updatedTask: Task): Task[] => {
  const current = loadTasks();
  const recalculated = recalculateTaskStatus(updatedTask);
  const updated = current.map(t => (t.id === recalculated.id ? recalculated : t));
  saveTasks(updated);
  return updated;
};

export const completeTask = (taskId: string, fechaEjecucion: string, observaciones?: string): Task[] => {
  const current = loadTasks();
  const updated = current.map(t => {
    if (t.id === taskId) {
      return recalculateTaskStatus({
        ...t,
        fechaEjecucion,
        observaciones: observaciones !== undefined ? observaciones : t.observaciones
      });
    }
    return t;
  });
  saveTasks(updated);
  return updated;
};

export const deleteTask = (taskId: string): Task[] => {
  const current = loadTasks();
  const updated = current.filter(t => t.id !== taskId);
  saveTasks(updated);
  return updated;
};

export const resetToInitial = (): Task[] => {
  const initial = (initialTasksData as Task[]).map(recalculateTaskStatus);
  saveTasks(initial);
  return initial;
};

export const calculateKPIs = (tasks: Task[]): KPIStats => {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      cumplidasATiempo: 0,
      cumplidasConAtraso: 0,
      pendientes: 0,
      noCumplidas: 0,
      sinFecha: 0,
      pctEficaciaGlobal: 0,
      pctOportunidadSLA: 0,
      promedioRetrasoDias: 0
    };
  }

  let cumplidasATiempo = 0;
  let cumplidasConAtraso = 0;
  let pendientes = 0;
  let noCumplidas = 0;
  let sinFecha = 0;
  let totalRetraso = 0;
  let countConRetraso = 0;

  for (const t of tasks) {
    if (t.estado === 'CUMPLIDA A TIEMPO') cumplidasATiempo++;
    else if (t.estado === 'CUMPLIDA CON ATRASO') {
      cumplidasConAtraso++;
      if (t.retrasoDias && t.retrasoDias > 0) {
        totalRetraso += t.retrasoDias;
        countConRetraso++;
      }
    } else if (t.estado === 'PENDIENTE') pendientes++;
    else if (t.estado === 'NO CUMPLIDA') {
      noCumplidas++;
      if (t.retrasoDias && t.retrasoDias > 0) {
        totalRetraso += t.retrasoDias;
        countConRetraso++;
      }
    } else if (t.estado === 'SIN FECHA COMPROMISO') sinFecha++;
  }

  const ejecutadas = cumplidasATiempo + cumplidasConAtraso;
  const pctEficaciaGlobal = total > 0 ? (ejecutadas / total) * 100 : 0;
  const denominadorSLA = cumplidasATiempo + cumplidasConAtraso + noCumplidas;
  const pctOportunidadSLA = denominadorSLA > 0 ? (cumplidasATiempo / denominadorSLA) * 100 : 0;
  const promedioRetrasoDias = countConRetraso > 0 ? Math.round((totalRetraso / countConRetraso) * 10) / 10 : 0;

  return {
    total,
    cumplidasATiempo,
    cumplidasConAtraso,
    pendientes,
    noCumplidas,
    sinFecha,
    pctEficaciaGlobal,
    pctOportunidadSLA,
    promedioRetrasoDias
  };
};
