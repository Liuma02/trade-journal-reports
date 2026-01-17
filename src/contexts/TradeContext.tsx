import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import * as tradesService from '@/services/tradesService';
import * as journalService from '@/services/journalService';
import { useToast } from '@/hooks/use-toast';

// ======================================================
// Interfaces
// ======================================================

export interface Trade {
  id: string;
  date: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  commission: number;
  duration: number;
  setup?: string;
  notes?: string;
  tags?: string[];
  mistakes?: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  notes: string;
  mood?: 'positive' | 'neutral' | 'negative';
}

interface TradeContextType {
  trades: Trade[];
  journalEntries: JournalEntry[];
  customTags: string[];
  isLoading: boolean;
  addTrade: (trade: Omit<Trade, 'id'>) => Promise<void>;
  addTrades: (trades: Omit<Trade, 'id'>[]) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  clearAllTrades: () => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  refreshData: () => Promise<void>;
  getTotalPnL: () => number;
  getWinRate: () => number;
  getProfitFactor: () => number;
  getTradesByDate: (date: string) => Trade[];
  getDailyPnL: () => { date: string; pnl: number; cumulative: number }[];
  getMaxDrawdown: () => number;
  getAverageRR: () => number;
  getPerformanceByTag: () => { tag: string; pnl: number; count: number; winRate: number }[];
  getPerformanceBySymbol: () => { symbol: string; pnl: number; count: number; winRate: number }[];
  getBestWorstTrades: () => { best: Trade | null; worst: Trade | null };
  getStreaks: () => { currentStreak: number; longestWinStreak: number; longestLossStreak: number };
}

// ======================================================
// Context Setup
// ======================================================

const TradeContext = createContext<TradeContextType | undefined>(undefined);
const DEFAULT_TAGS = ['FOMO', 'REVENGE', 'OVERSIZE', 'PATIENCE', 'BREAKOUT', 'TREND', 'REVERSAL', 'NEWS'];

const generateId = () => Math.random().toString(36).slice(2, 11);

// ======================================================
// Helpers: DB ↔ JS Mappers
// ======================================================

const dbRowToTrade = (row: any): Trade => ({
  id: row.id,
  date: row.trade_date,
  symbol: row.instrument,
  side: row.direction as 'long' | 'short',
  entryPrice: parseFloat(row.entry_price),
  exitPrice: parseFloat(row.exit_price),
  quantity: parseFloat(row.size),
  pnl: parseFloat(row.pnl),
  commission: parseFloat(row.commission ?? 0),
  duration: row.duration_seconds ?? 0,
  setup: row.setup ?? undefined,
  notes: row.notes ?? undefined,
  tags: row.tags ?? [],
  mistakes: row.mistakes ?? [],
});

const tradeToDbRow = (trade: Omit<Trade, 'id'>, userId: string) => ({
  user_id: userId,
  trade_date: trade.date,
  instrument: trade.symbol,
  direction: trade.side,
  entry_price: trade.entryPrice,
  exit_price: trade.exitPrice,
  size: trade.quantity,
  pnl: trade.pnl,
  commission: trade.commission ?? 0,
  duration_seconds: trade.duration,
  setup: trade.setup ?? null,
  notes: trade.notes ?? null,
  tags: trade.tags ?? [],
  mistakes: trade.mistakes ?? [],
});

const dbRowToJournalEntry = (row: any): JournalEntry => ({
  id: row.id,
  date: row.trade_date,
  notes: row.content ?? '',
  mood: row.mood as 'positive' | 'neutral' | 'negative' | undefined,
});

const journalEntryToDbRow = (entry: Omit<JournalEntry, 'id'>, userId: string) => ({
  user_id: userId,
  trade_date: entry.date,
  content: entry.notes,
  mood: entry.mood ?? null,
});

// ======================================================
// Provider
// ======================================================

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [customTags, setCustomTags] = useState<string[]>(DEFAULT_TAGS);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const isConfigured = isSupabaseConfigured();

  // ---------- REFRESH ----------
  const refreshData = useCallback(async () => {
    if (!isConfigured || !user) {
      setTrades([]);
      setJournalEntries([]);
      return;
    }

    setIsLoading(true);
    try {
      const [tradesResult, journalResult] = await Promise.all([
        tradesService.fetchTrades(),
        journalService.fetchJournalEntries(),
      ]);

      if (tradesResult.error) {
        toast({ title: 'Error', description: 'Failed to load trades', variant: 'destructive' });
      } else {
        const rows = Array.isArray(tradesResult.data) ? tradesResult.data : [];
        setTrades(rows.map(dbRowToTrade));
      }

      if (journalResult.error) {
        toast({ title: 'Error', description: 'Failed to load journal entries', variant: 'destructive' });
      } else {
        const rows = Array.isArray(journalResult.data) ? journalResult.data : [];
        setJournalEntries(rows.map(dbRowToJournalEntry));
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, user, toast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ---------- TRADE CRUD ----------
  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>) => {
    if (!isConfigured || !user) {
      setTrades(prev => [...prev, { ...trade, id: generateId() }]);
      return;
    }

    const result = await tradesService.createTrade(tradeToDbRow(trade, user.id));
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    if (data) setTrades(prev => [dbRowToTrade(data), ...prev]);
  }, [isConfigured, user, toast]);

  const addTrades = useCallback(async (newTrades: Omit<Trade, 'id'>[]) => {
    if (!isConfigured || !user) {
      setTrades(prev => [...prev, ...newTrades.map(t => ({ ...t, id: generateId() }))]);
      return;
    }

    const dbRows = newTrades.map(t => tradeToDbRow(t, user.id));
    const result = await tradesService.createTrades(dbRows);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    const rows = Array.isArray(result.data) ? result.data : [];
    setTrades(prev => [...rows.map(dbRowToTrade), ...prev]);
  }, [isConfigured, user, toast]);

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    if (!isConfigured || !user) {
      setTrades(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
      return;
    }

    const dbUpdates: any = {};
    if (updates.date) dbUpdates.trade_date = updates.date;
    if (updates.symbol) dbUpdates.instrument = updates.symbol;
    if (updates.side) dbUpdates.direction = updates.side;
    if (updates.entryPrice !== undefined) dbUpdates.entry_price = updates.entryPrice;
    if (updates.exitPrice !== undefined) dbUpdates.exit_price = updates.exitPrice;
    if (updates.quantity !== undefined) dbUpdates.size = updates.quantity;
    if (updates.pnl !== undefined) dbUpdates.pnl = updates.pnl;
    if (updates.duration !== undefined) dbUpdates.duration_seconds = updates.duration;
    if (updates.setup !== undefined) dbUpdates.setup = updates.setup;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.mistakes !== undefined) dbUpdates.mistakes = updates.mistakes;

    const result = await tradesService.updateTrade(id, dbUpdates);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    if (result.data) {
      const updated = Array.isArray(result.data) ? result.data[0] : result.data;
      setTrades(prev => prev.map(t => (t.id === id ? dbRowToTrade(updated) : t)));
    }
  }, [isConfigured, user, toast]);

  const deleteTrade = useCallback(async (id: string) => {
    if (!isConfigured || !user) {
      setTrades(prev => prev.filter(t => t.id !== id));
      return;
    }

    const result = await tradesService.deleteTrade(id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    setTrades(prev => prev.filter(t => t.id !== id));
  }, [isConfigured, user, toast]);

  const clearAllTrades = useCallback(async () => {
    if (!isConfigured || !user) {
      setTrades([]);
      setJournalEntries([]);
      return;
    }

    const result = await tradesService.deleteAllTrades(user.id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    setTrades([]);
  }, [isConfigured, user, toast]);

  // ---------- JOURNAL CRUD ----------
  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    if (!isConfigured || !user) {
      setJournalEntries(prev => [...prev, { ...entry, id: generateId() }]);
      return;
    }

    const result = await journalService.createJournalEntry(journalEntryToDbRow(entry, user.id));
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    if (data) setJournalEntries(prev => [dbRowToJournalEntry(data), ...prev]);
  }, [isConfigured, user, toast]);

  const updateJournalEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    if (!isConfigured || !user) {
      setJournalEntries(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
      return;
    }

    const dbUpdates: any = {};
    if (updates.date) dbUpdates.trade_date = updates.date;
    if (updates.notes) dbUpdates.content = updates.notes;
    if (updates.mood) dbUpdates.mood = updates.mood;

    const result = await journalService.updateJournalEntry(id, dbUpdates);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    if (result.data) {
      const updated = Array.isArray(result.data) ? result.data[0] : result.data;
      setJournalEntries(prev => prev.map(e => (e.id === id ? dbRowToJournalEntry(updated) : e)));
    }
  }, [isConfigured, user, toast]);

  const deleteJournalEntry = useCallback(async (id: string) => {
    if (!isConfigured || !user) {
      setJournalEntries(prev => prev.filter(e => e.id !== id));
      return;
    }

    const result = await journalService.deleteJournalEntry(id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    setJournalEntries(prev => prev.filter(e => e.id !== id));
  }, [isConfigured, user, toast]);

  // ---------- TAGS ----------
  const addCustomTag = useCallback((tag: string) => {
    setCustomTags(prev => {
      const normalized = tag.toUpperCase().trim();
      if (!prev.includes(normalized)) return [...prev, normalized];
      return prev;
    });
  }, []);

  const removeCustomTag = useCallback((tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  }, []);

  // ---------- STATS ----------
  const getTotalPnL = useCallback(() => trades.reduce((sum, t) => sum + t.pnl - t.commission, 0), [trades]);
  const getWinRate = useCallback(() => (trades.length ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0), [trades]);

  // ---------- PROVIDER VALUE ----------
  return (
    <TradeContext.Provider
      value={{
        trades,
        journalEntries,
        customTags,
        isLoading,
        addTrade,
        addTrades,
        updateTrade,
        deleteTrade,
        clearAllTrades,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addCustomTag,
        removeCustomTag,
        refreshData,
        getTotalPnL,
        getWinRate,
        getProfitFactor: () => 0, // TODO: reuse if needed
        getTradesByDate: (d: string) => trades.filter(t => t.date === d),
        getDailyPnL: () => [],
        getMaxDrawdown: () => 0,
        getAverageRR: () => 0,
        getPerformanceByTag: () => [],
        getPerformanceBySymbol: () => [],
        getBestWorstTrades: () => ({ best: null, worst: null }),
        getStreaks: () => ({ currentStreak: 0, longestWinStreak: 0, longestLossStreak: 0 }),
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

// ======================================================
// Hook
// ======================================================

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) throw new Error('useTrades must be used within a TradeProvider');
  return context;
};
