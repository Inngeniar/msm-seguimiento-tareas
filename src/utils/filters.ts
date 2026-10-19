import { Task, UserRole } from '../types';

export const getTaskDate = (task: Task): string => {
  return task.fechaEvaluacion || task.fechaAsignacion || task.fechaCompromiso || '';
};

export const getTaskYear = (task: Task): string => {
  const d = getTaskDate(task);
  return d && d.length >= 4 ? d.slice(0, 4) : '';
};

export const getTaskMonth = (task: Task): string => {
  const d = getTaskDate(task);
  if (!d || d.length < 7) return '';
  const parts = d.split('-');
  return parts.length >= 2 ? parts[1] : '';
};

export interface TaskFilterCriteria {
  uo?: string;
  role?: UserRole | string;
  year?: string;
  month?: string;
}

export const filterTasks = (tasks: Task[], criteria: TaskFilterCriteria): Task[] => {
  return tasks.filter(t => {
    if (criteria.uo && t.uo !== criteria.uo) return false;
    if (criteria.role && criteria.role !== 'TODOS' && t.responsable !== criteria.role) return false;
    if (criteria.year) {
      const yr = getTaskYear(t);
      if (yr !== criteria.year) return false;
    }
    if (criteria.month) {
      const mo = getTaskMonth(t);
      if (mo !== criteria.month) return false;
    }
    return true;
  });
};

export const MONTH_NAMES: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre'
};
