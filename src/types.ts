export interface Task {
  id: string;
  row?: number;
  uo: string;
  fechaEvaluacion: string;
  proceso: string;
  evaluador: string;
  situacion: string;
  tarea: string;
  responsable: string;
  fechaAsignacion: string;
  fechaCompromiso: string;
  fechaEjecucion?: string;
  diasCompromiso?: number;
  avance?: number;
  estado: TaskStatus;
  retrasoDias?: number;
  observaciones?: string;
  resultadosCifras?: string;
}

export type TaskStatus = 
  | 'CUMPLIDA A TIEMPO'
  | 'CUMPLIDA CON ATRASO'
  | 'PENDIENTE'
  | 'NO CUMPLIDA'
  | 'SIN FECHA COMPROMISO';

export type UserRole = 
  | 'TODOS'
  | 'DIRECTOR UO'
  | 'LÍDER DE PROCESO'
  | 'DOE'
  | 'COORDINADOR DE CALIDAD'
  | 'GERENCIA';

export interface Catalogs {
  uos: string[];
  procesos: string[];
  evaluadores: string[];
  responsables: string[];
  estados: TaskStatus[];
}

export interface FilterState {
  search: string;
  uo: string;
  proceso: string;
  responsable: string;
  estado: string;
  dateStart?: string;
  dateEnd?: string;
}

export interface KPIStats {
  total: number;
  cumplidasATiempo: number;
  cumplidasConAtraso: number;
  pendientes: number;
  noCumplidas: number;
  sinFecha: number;
  pctEficaciaGlobal: number;
  pctOportunidadSLA: number;
  promedioRetrasoDias: number;
}
