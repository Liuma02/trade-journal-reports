import { supabase } from '@/lib/supabase';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function fetchJournalEntries(): Promise<ServiceResult<any[]>> {
  const { data, error } = await supabase.from('journal_entries').select('*').order('trade_date', { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createJournalEntry(entry: any): Promise<ServiceResult<any>> {
  const { data, error } = await supabase.from('journal_entries').insert(entry).select().single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateJournalEntry(id: string, updates: any): Promise<ServiceResult<any>> {
  const { data, error } = await supabase.from('journal_entries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function deleteJournalEntry(id: string): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}
