import * as XLSX from 'xlsx';
import { Task } from '../types';

export const exportTasksToExcel = (tasks: Task[], filename = 'DOE-FT-001_Seguimiento_Tareas_Actualizado.xlsx') => {
  // Map tasks to official DOE-FT-001 format
  const rows = tasks.map(t => ({
    'UO': t.uo,
    'Fecha Evaluación': t.fechaEvaluacion,
    'Proceso Evaluado': t.proceso,
    'Evaluador': t.evaluador,
    'Situación encontrada (Concisa)': t.situacion,
    'Tarea Asignada(Concisa)': t.tarea,
    'Responsable (Cargo)': t.responsable,
    'Fecha Asignación': t.fechaAsignacion,
    'Fecha Compromiso': t.fechaCompromiso,
    'Fecha Ejecución': t.fechaEjecucion || '',
    'Días Compromiso': t.diasCompromiso || '',
    '%Avance': `${Math.round((t.avance || 0) * 100)}%`,
    'Estado Tarea': t.estado,
    'Retraso_Días': t.retrasoDias || 0,
    'Observaciones': t.observaciones || '',
    'Resultados en cifras': t.resultadosCifras || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // UO
    { wch: 14 }, // Fecha Eval
    { wch: 28 }, // Proceso
    { wch: 24 }, // Evaluador
    { wch: 35 }, // Situacion
    { wch: 40 }, // Tarea
    { wch: 22 }, // Responsable
    { wch: 14 }, // Fecha Asig
    { wch: 14 }, // Fecha Comp
    { wch: 14 }, // Fecha Ejec
    { wch: 14 }, // Dias SLA
    { wch: 10 }, // % Avance
    { wch: 20 }, // Estado
    { wch: 12 }, // Retraso
    { wch: 40 }, // Observaciones
    { wch: 18 }  // Cifras
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Matriz de Tareas');
  XLSX.writeFile(workbook, filename);
};

export const parseExcelFile = (file: File): Promise<Partial<Task>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const parsed: Partial<Task>[] = json.map((r, i) => ({
          id: `TASK-IMP-${String(i + 1).padStart(4, '0')}`,
          uo: r['UO'] || r['Unidad'] || '',
          fechaEvaluacion: r['Fecha Evaluación'] || r['Fecha Eval'] || '',
          proceso: r['Proceso Evaluado'] || r['Proceso'] || '',
          evaluador: r['Evaluador'] || '',
          situacion: r['Situación encontrada (Concisa)'] || r['Situacion'] || '',
          tarea: r['Tarea Asignada(Concisa)'] || r['Tarea'] || '',
          responsable: r['Responsable (Cargo)'] || r['Responsable'] || '',
          fechaAsignacion: r['Fecha Asignación'] || '',
          fechaCompromiso: r['Fecha Compromiso'] || '',
          fechaEjecucion: r['Fecha Ejecución'] || '',
          observaciones: r['Observaciones'] || '',
          resultadosCifras: r['Resultados en cifras'] || ''
        }));

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
