import React, { createContext, useContext, useState, useCallback } from 'react';

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
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  addTrades: (trades: Omit<Trade, 'id'>[]) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  clearAllTrades: () => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  importFromCSV: (csvContent: string, brokerFormat: string) => { success: boolean; count: number; errors: string[] };
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

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [customTags, setCustomTags] = useState<string[]>(DEFAULT_TAGS);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTrade = useCallback((trade: Omit<Trade, 'id'>) => {
    setTrades(prev => [...prev, { ...trade, id: generateId() }]);
  }, []);

  const addTrades = useCallback((newTrades: Omit<Trade, 'id'>[]) => {
    const tradesWithIds = newTrades.map(trade => ({ ...trade, id: generateId() }));
    setTrades(prev => [...prev, ...tradesWithIds]);
  }, []);

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    setTrades(prev => prev.map(trade => trade.id === id ? { ...trade, ...updates } : trade));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== id));
  }, []);

  const clearAllTrades = useCallback(() => {
    setTrades([]);
    setJournalEntries([]);
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    setJournalEntries(prev => [...prev, { ...entry, id: generateId() }]);
  }, []);

  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

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

  const importFromCSV = useCallback((csvContent: string, brokerFormat: string): { success: boolean; count: number; errors: string[] } => {
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
      addTrades(newTrades);
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
