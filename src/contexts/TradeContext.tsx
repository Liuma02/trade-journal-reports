import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import * as tradesService from '@/services/tradesService';
import * as journalService from '@/services/journalService';
import { useToast } from '@/hooks/use-toast';

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
  lessons?: string;
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
  importFromCSV: (csvContent: string, brokerFormat: string) => Promise<{ success: boolean; count: number; errors: string[] }>;
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

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const DEFAULT_TAGS = ['FOMO', 'REVENGE', 'OVERSIZE', 'PATIENCE', 'BREAKOUT', 'TREND', 'REVERSAL', 'NEWS'];

// Helper to convert database row to Trade interface
const dbRowToTrade = (row: any): Trade => ({
  id: row.id,
  date: row.trade_date,
  symbol: row.symbol,
  side: row.side as 'long' | 'short',
  entryPrice: parseFloat(row.entry_price),
  exitPrice: parseFloat(row.exit_price),
  quantity: parseFloat(row.quantity),
  pnl: parseFloat(row.pnl),
  commission: parseFloat(row.commission),
  duration: row.duration || 0,
  setup: row.setup || undefined,
  notes: row.notes || undefined,
  tags: row.tags || [],
  mistakes: row.mistakes || [],
});

// Helper to convert Trade to database row format
const tradeToDbRow = (trade: Omit<Trade, 'id'>, userId: string) => ({
  user_id: userId,
  trade_date: trade.date,
  symbol: trade.symbol,
  side: trade.side,
  entry_price: trade.entryPrice,
  exit_price: trade.exitPrice,
  quantity: trade.quantity,
  pnl: trade.pnl,
  commission: trade.commission,
  duration: trade.duration,
  setup: trade.setup || null,
  notes: trade.notes || null,
  tags: trade.tags || [],
  mistakes: trade.mistakes || [],
});

// Helper to convert database row to JournalEntry interface
const dbRowToJournalEntry = (row: any): JournalEntry => ({
  id: row.id,
  date: row.trade_date,
  notes: row.notes || '',
  mood: row.mood as 'positive' | 'neutral' | 'negative' | undefined,
  lessons: row.lessons || undefined,
});

// Helper to convert JournalEntry to database row format
const journalEntryToDbRow = (entry: Omit<JournalEntry, 'id'>, userId: string) => ({
  user_id: userId,
  trade_date: entry.date,
  notes: entry.notes,
  mood: entry.mood || null,
  lessons: entry.lessons || null,
});

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [customTags, setCustomTags] = useState<string[]>(DEFAULT_TAGS);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isConfigured = isSupabaseConfigured();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Fetch data from Supabase when user changes
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
        console.error('Error fetching trades:', tradesResult.error);
        toast({ title: 'Error', description: 'Failed to load trades', variant: 'destructive' });
      } else {
        setTrades((tradesResult.data || []).map(dbRowToTrade));
      }

      if (journalResult.error) {
        console.error('Error fetching journal:', journalResult.error);
      } else {
        setJournalEntries((journalResult.data || []).map(dbRowToJournalEntry));
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

  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>) => {
    if (!isConfigured || !user) {
      // Local mode
      setTrades(prev => [...prev, { ...trade, id: generateId() }]);
      return;
    }

    const dbRow = tradeToDbRow(trade, user.id);
    const result = await tradesService.createTrade(dbRow);
    
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    
    if (result.data) {
      setTrades(prev => [dbRowToTrade(result.data), ...prev]);
    }
  }, [isConfigured, user, toast]);

  const addTrades = useCallback(async (newTrades: Omit<Trade, 'id'>[]) => {
    if (!isConfigured || !user) {
      // Local mode
      const tradesWithIds = newTrades.map(trade => ({ ...trade, id: generateId() }));
      setTrades(prev => [...prev, ...tradesWithIds]);
      return;
    }

    const dbRows = newTrades.map(trade => tradeToDbRow(trade, user.id));
    const result = await tradesService.createTrades(dbRows);
    
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    
    if (result.data) {
      setTrades(prev => [...result.data.map(dbRowToTrade), ...prev]);
    }
  }, [isConfigured, user, toast]);

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    if (!isConfigured || !user) {
      // Local mode
      setTrades(prev => prev.map(trade => trade.id === id ? { ...trade, ...updates } : trade));
      return;
    }

    // Convert updates to db format
    const dbUpdates: any = {};
    if (updates.date !== undefined) dbUpdates.trade_date = updates.date;
    if (updates.symbol !== undefined) dbUpdates.symbol = updates.symbol;
    if (updates.side !== undefined) dbUpdates.side = updates.side;
    if (updates.entryPrice !== undefined) dbUpdates.entry_price = updates.entryPrice;
    if (updates.exitPrice !== undefined) dbUpdates.exit_price = updates.exitPrice;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.pnl !== undefined) dbUpdates.pnl = updates.pnl;
    if (updates.commission !== undefined) dbUpdates.commission = updates.commission;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
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
      setTrades(prev => prev.map(trade => trade.id === id ? dbRowToTrade(result.data) : trade));
    }
  }, [isConfigured, user, toast]);

  const deleteTrade = useCallback(async (id: string) => {
    if (!isConfigured || !user) {
      // Local mode
      setTrades(prev => prev.filter(trade => trade.id !== id));
      return;
    }

    const result = await tradesService.deleteTrade(id);
    
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    
    setTrades(prev => prev.filter(trade => trade.id !== id));
  }, [isConfigured, user, toast]);

  const clearAllTrades = useCallback(async () => {
    if (!isConfigured || !user) {
      // Local mode
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

  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    if (!isConfigured || !user) {
      // Local mode
      setJournalEntries(prev => [...prev, { ...entry, id: generateId() }]);
      return;
    }

    const dbRow = journalEntryToDbRow(entry, user.id);
    const result = await journalService.createJournalEntry(dbRow);
    
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    
    if (result.data) {
      setJournalEntries(prev => [dbRowToJournalEntry(result.data), ...prev]);
    }
  }, [isConfigured, user, toast]);

  const updateJournalEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    if (!isConfigured || !user) {
      // Local mode
      setJournalEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
      return;
    }

    // Convert updates to db format
    const dbUpdates: any = {};
    if (updates.date !== undefined) dbUpdates.trade_date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
    if (updates.lessons !== undefined) dbUpdates.lessons = updates.lessons;

    const result = await journalService.updateJournalEntry(id, dbUpdates);
    
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    
    if (result.data) {
      setJournalEntries(prev => prev.map(entry => entry.id === id ? dbRowToJournalEntry(result.data) : entry));
    }
  }, [isConfigured, user, toast]);

  const deleteJournalEntry = useCallback(async (id: string) => {
    if (!isConfigured || !user) {
      // Local mode
      setJournalEntries(prev => prev.filter(entry => entry.id !== id));
      return;
    }

    const result = await journalService.deleteJournalEntry(id);
    
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, [isConfigured, user, toast]);

  const addCustomTag = useCallback((tag: string) => {
    setCustomTags(prev => {
      const normalized = tag.toUpperCase().trim();
      if (!prev.includes(normalized)) {
        return [...prev, normalized];
      }
      return prev;
    });
  }, []);

  const removeCustomTag = useCallback((tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  }, []);

  const importFromCSV = useCallback(async (csvContent: string, brokerFormat: string): Promise<{ success: boolean; count: number; errors: string[] }> => {
    const errors: string[] = [];
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return { success: false, count: 0, errors: ['CSV file is empty or has no data rows'] };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const newTrades: Omit<Trade, 'id'>[] = [];

    const getColumnIndex = (possibleNames: string[]) => {
      return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
    };

    const dateIdx = getColumnIndex(['date', 'time', 'open time', 'entry time', 'trade date']);
    const symbolIdx = getColumnIndex(['symbol', 'instrument', 'ticker', 'pair', 'asset']);
    const sideIdx = getColumnIndex(['side', 'type', 'direction', 'action', 'buy/sell']);
    const entryPriceIdx = getColumnIndex(['entry', 'open', 'entry price', 'open price']);
    const exitPriceIdx = getColumnIndex(['exit', 'close', 'exit price', 'close price']);
    const quantityIdx = getColumnIndex(['quantity', 'volume', 'lots', 'size', 'qty', 'amount']);
    const pnlIdx = getColumnIndex(['pnl', 'profit', 'p/l', 'p&l', 'net profit', 'realized pnl']);
    const commissionIdx = getColumnIndex(['commission', 'fee', 'fees', 'swap', 'cost']);

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < 3) continue;

        const dateStr = dateIdx >= 0 ? values[dateIdx] : values[0];
        const symbol = symbolIdx >= 0 ? values[symbolIdx] : values[1] || 'UNKNOWN';
        const sideStr = sideIdx >= 0 ? values[sideIdx]?.toLowerCase() : 'long';
        const entryPrice = entryPriceIdx >= 0 ? parseFloat(values[entryPriceIdx]) : 0;
        const exitPrice = exitPriceIdx >= 0 ? parseFloat(values[exitPriceIdx]) : 0;
        const quantity = quantityIdx >= 0 ? parseFloat(values[quantityIdx]) : 1;
        const pnl = pnlIdx >= 0 ? parseFloat(values[pnlIdx]) : 0;
        const commission = commissionIdx >= 0 ? parseFloat(values[commissionIdx]) : 0;

        let parsedDate: Date;
        try {
          parsedDate = new Date(dateStr);
          if (isNaN(parsedDate.getTime())) throw new Error('Invalid date');
        } catch {
          errors.push(`Row ${i + 1}: Invalid date format "${dateStr}"`);
          continue;
        }

        const trade: Omit<Trade, 'id'> = {
          date: parsedDate.toISOString().split('T')[0],
          symbol: symbol.toUpperCase(),
          side: sideStr.includes('sell') || sideStr.includes('short') ? 'short' : 'long',
          entryPrice: isNaN(entryPrice) ? 0 : entryPrice,
          exitPrice: isNaN(exitPrice) ? 0 : exitPrice,
          quantity: isNaN(quantity) ? 1 : Math.abs(quantity),
          pnl: isNaN(pnl) ? 0 : pnl,
          commission: isNaN(commission) ? 0 : Math.abs(commission),
          duration: 60,
          tags: [],
        };

        newTrades.push(trade);
      } catch (err) {
        errors.push(`Row ${i + 1}: Failed to parse row`);
      }
    }

    if (newTrades.length > 0) {
      await addTrades(newTrades);
      return { success: true, count: newTrades.length, errors };
    }

    return { success: false, count: 0, errors: errors.length > 0 ? errors : ['No valid trades found in CSV'] };
  }, [addTrades]);

  const getTotalPnL = useCallback(() => {
    return trades.reduce((sum, trade) => sum + trade.pnl - trade.commission, 0);
  }, [trades]);

  const getWinRate = useCallback(() => {
    if (trades.length === 0) return 0;
    const winners = trades.filter(t => t.pnl > 0).length;
    return (winners / trades.length) * 100;
  }, [trades]);

  const getProfitFactor = useCallback(() => {
    const profits = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const losses = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    return losses > 0 ? profits / losses : profits > 0 ? Infinity : 0;
  }, [trades]);

  const getTradesByDate = useCallback((date: string) => {
    return trades.filter(t => t.date === date);
  }, [trades]);

  const getDailyPnL = useCallback(() => {
    const dailyMap = new Map<string, number>();
    trades.forEach(trade => {
      const current = dailyMap.get(trade.date) || 0;
      dailyMap.set(trade.date, current + trade.pnl - trade.commission);
    });

    const sorted = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    let cumulative = 0;
    return sorted.map(([date, pnl]) => {
      cumulative += pnl;
      return { date, pnl, cumulative };
    });
  }, [trades]);

  const getMaxDrawdown = useCallback(() => {
    if (trades.length === 0) return 0;
    
    const dailyPnL = getDailyPnL();
    let peak = 0;
    let maxDrawdown = 0;
    
    dailyPnL.forEach(({ cumulative }) => {
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    return maxDrawdown;
  }, [trades, getDailyPnL]);

  const getAverageRR = useCallback(() => {
    const winners = trades.filter(t => t.pnl > 0);
    const losers = trades.filter(t => t.pnl < 0);
    
    if (losers.length === 0 || winners.length === 0) return 0;
    
    const avgWin = winners.reduce((sum, t) => sum + t.pnl, 0) / winners.length;
    const avgLoss = Math.abs(losers.reduce((sum, t) => sum + t.pnl, 0) / losers.length);
    
    return avgLoss > 0 ? avgWin / avgLoss : 0;
  }, [trades]);

  const getPerformanceByTag = useCallback(() => {
    const tagStats = new Map<string, { pnl: number; count: number; wins: number }>();
    
    trades.forEach(trade => {
      (trade.tags || []).forEach(tag => {
        const current = tagStats.get(tag) || { pnl: 0, count: 0, wins: 0 };
        tagStats.set(tag, {
          pnl: current.pnl + trade.pnl - trade.commission,
          count: current.count + 1,
          wins: current.wins + (trade.pnl > 0 ? 1 : 0),
        });
      });
    });
    
    return Array.from(tagStats.entries()).map(([tag, stats]) => ({
      tag,
      pnl: stats.pnl,
      count: stats.count,
      winRate: stats.count > 0 ? (stats.wins / stats.count) * 100 : 0,
    }));
  }, [trades]);

  const getPerformanceBySymbol = useCallback(() => {
    const symbolStats = new Map<string, { pnl: number; count: number; wins: number }>();
    
    trades.forEach(trade => {
      const current = symbolStats.get(trade.symbol) || { pnl: 0, count: 0, wins: 0 };
      symbolStats.set(trade.symbol, {
        pnl: current.pnl + trade.pnl - trade.commission,
        count: current.count + 1,
        wins: current.wins + (trade.pnl > 0 ? 1 : 0),
      });
    });
    
    return Array.from(symbolStats.entries())
      .map(([symbol, stats]) => ({
        symbol,
        pnl: stats.pnl,
        count: stats.count,
        winRate: stats.count > 0 ? (stats.wins / stats.count) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const getBestWorstTrades = useCallback(() => {
    if (trades.length === 0) return { best: null, worst: null };
    
    const sorted = [...trades].sort((a, b) => b.pnl - a.pnl);
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
    };
  }, [trades]);

  const getStreaks = useCallback(() => {
    if (trades.length === 0) return { currentStreak: 0, longestWinStreak: 0, longestLossStreak: 0 };
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    sortedTrades.forEach(trade => {
      if (trade.pnl > 0) {
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
      } else {
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > longestLossStreak) longestLossStreak = tempLossStreak;
      }
    });
    
    const lastTrade = sortedTrades[sortedTrades.length - 1];
    if (lastTrade.pnl > 0) {
      currentStreak = tempWinStreak;
    } else {
      currentStreak = -tempLossStreak;
    }
    
    return { currentStreak, longestWinStreak, longestLossStreak };
  }, [trades]);

  return (
    <TradeContext.Provider value={{
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
      importFromCSV,
      refreshData,
      getTotalPnL,
      getWinRate,
      getProfitFactor,
      getTradesByDate,
      getDailyPnL,
      getMaxDrawdown,
      getAverageRR,
      getPerformanceByTag,
      getPerformanceBySymbol,
      getBestWorstTrades,
      getStreaks,
    }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};
