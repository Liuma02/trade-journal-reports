import { supabase } from '@/lib/supabase';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function fetchTrades(): Promise<ServiceResult<any[]>> {
  const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createTrade(trade: any): Promise<ServiceResult<any>> {
  const { data, error } = await supabase.from('trades').insert(trade).select().single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createTrades(trades: any[]): Promise<ServiceResult<any[]>> {
  const { data, error } = await supabase.from('trades').insert(trades).select();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateTrade(id: string, updates: any): Promise<ServiceResult<any>> {
  const { data, error } = await supabase.from('trades').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function deleteTrade(id: string): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.from('trades').delete().eq('id', id);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

export async function deleteAllTrades(userId: string): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.from('trades').delete().eq('user_id', userId);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
