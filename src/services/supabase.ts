import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Configuración por defecto oficial Mundo Salud Médica
export const DEFAULT_SUPABASE_URL = 'https://kghrlpwhtasvjspaeqah.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaHJscHdodGFzdmpzcGFlcWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxOTUyNzgsImV4cCI6MjEwNzc3MTI3OH0.dcnc_bzcgYe68pwMCNspExpc7Ht3wBQKi7kOCJ_ALAo';

const SUPABASE_CONFIG_KEY = 'msm_supabase_config_v1';

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey && parsed.url.trim().length > 0 && parsed.anonKey.trim().length > 0) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim()
        };
      }
    }
  } catch {
    // ignore json error
  }

  return {
    url: envUrl,
    anonKey: envKey
  };
};

export const saveStoredSupabaseConfig = (config: SupabaseConfig): void => {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  _client = null; // Reset cached client
};

export const clearStoredSupabaseConfig = (): void => {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  _client = null;
};

let _client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (_client) return _client;
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      _client = createClient(config.url, config.anonKey, {
        auth: { persistSession: false }
      });
      return _client;
    } catch (err) {
      console.error('Error inicializando cliente de Supabase:', err);
      return null;
    }
  }
  return null;
};

// Database row mapper
export const mapTaskToRow = (task: Task) => ({
  id: task.id,
  row_num: task.row || 0,
  uo: task.uo,
  fecha_evaluacion: task.fechaEvaluacion,
  proceso: task.proceso,
  evaluador: task.evaluador,
  situacion: task.situacion,
  tarea: task.tarea,
  responsable: task.responsable,
  fecha_asignacion: task.fechaAsignacion,
  fecha_compromiso: task.fechaCompromiso,
  fecha_ejecucion: task.fechaEjecucion || null,
  dias_compromiso: task.diasCompromiso ?? 0,
  avance: task.avance ?? 0,
  estado: task.estado,
  retraso_dias: task.retrasoDias ?? 0,
  observaciones: task.observaciones || '',
  resultados_cifras: task.resultadosCifras || '',
  updated_at: new Date().toISOString()
});

export const mapRowToTask = (row: any): Task => ({
  id: row.id,
  row: row.row_num,
  uo: row.uo,
  fechaEvaluacion: row.fecha_evaluacion,
  proceso: row.proceso,
  evaluador: row.evaluador,
  situacion: row.situacion,
  tarea: row.tarea,
  responsable: row.responsable,
  fechaAsignacion: row.fecha_asignacion,
  fechaCompromiso: row.fecha_compromiso,
  fechaEjecucion: row.fecha_ejecucion || undefined,
  diasCompromiso: row.dias_compromiso,
  avance: row.avance,
  estado: row.estado,
  retrasoDias: row.retraso_dias,
  observaciones: row.observaciones || undefined,
  resultadosCifras: row.resultados_cifras || undefined
});

export const testCloudConnection = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'No hay credenciales de Supabase configuradas.' };
  }

  try {
    const { count, error } = await client
      .from('msm_tareas')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return { 
          success: false, 
          message: 'La tabla "msm_tareas" aún no existe en Supabase. Ejecuta el script SQL suministrado en el Editor SQL de Supabase.' 
        };
      }
      return { success: false, message: `Error Supabase: ${error.message}` };
    }

    return { 
      success: true, 
      message: `Conexión exitosa. ${count ?? 0} tareas en la nube.`, 
      count: count ?? 0 
    };
  } catch (err: any) {
    return { success: false, message: `Fallo de red o URL inválida: ${err.message || err}` };
  }
};

export const fetchCloudTasks = async (): Promise<Task[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('msm_tareas')
      .select('*')
      .order('id', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('Error fetching tasks from Supabase:', error);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map(mapRowToTask);
    }
    return null;
  } catch (err) {
    console.error('Error conectando a Supabase:', err);
    return null;
  }
};

export const upsertCloudTask = async (task: Task): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapTaskToRow(task);
    const { error } = await client
      .from('msm_tareas')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Error upserting task to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception upserting to Supabase:', err);
    return false;
  }
};

export const deleteCloudTask = async (taskId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('msm_tareas')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception deleting task from Supabase:', err);
    return false;
  }
};

export const batchSyncTasksToCloud = async (tasks: Task[]): Promise<{ success: boolean; count: number; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Cliente no configurado' };

  try {
    const rows = tasks.map(mapTaskToRow);
    
    // Batch in chunks of 100 to avoid payload size limits
    const CHUNK_SIZE = 100;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { error } = await client
        .from('msm_tareas')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        return { success: false, count: i, error: error.message };
      }
    }

    return { success: true, count: tasks.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || String(err) };
  }
};

export const subscribeToCloudChanges = (onDataChanged: () => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('msm-tareas-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'msm_tareas' },
      () => {
        onDataChanged();
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

export const SUPABASE_SQL_SETUP = `-- ========================================================
-- SCRIPT DE INICIALIZACIÓN MUNDO SALUD MÉDICA EN SUPABASE
-- Pega este código en el "SQL Editor" de tu proyecto Supabase y dale "Run"
-- ========================================================

create table if not exists public.msm_tareas (
  id text primary key,
  row_num integer default 0,
  uo text not null,
  fecha_evaluacion text not null,
  proceso text not null,
  evaluador text not null,
  situacion text not null,
  tarea text not null,
  responsable text not null,
  fecha_asignacion text not null,
  fecha_compromiso text not null,
  fecha_ejecucion text,
  dias_compromiso integer default 0,
  avance float default 0,
  estado text not null,
  retraso_dias integer default 0,
  observaciones text,
  resultados_cifras text,
  updated_at timestamp with time zone default now()
);

-- Habilitar permisos públicos anónimos para la app
alter table public.msm_tareas enable row level security;

create policy "Permitir lectura publica de msm_tareas"
  on public.msm_tareas for select
  using (true);

create policy "Permitir insercion y actualizacion publica de msm_tareas"
  on public.msm_tareas for all
  using (true)
  with check (true);

-- Habilitar Realtime para reflejo instantáneo en todos los navegadores
alter publication supabase_realtime add table public.msm_tareas;
`;
