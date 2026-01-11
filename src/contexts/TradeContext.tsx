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
  duration: number; // in minutes
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
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  addTrades: (trades: Omit<Trade, 'id'>[]) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  importFromCSV: (csvContent: string, brokerFormat: string) => { success: boolean; count: number; errors: string[] };
  getTotalPnL: () => number;
  getWinRate: () => number;
  getProfitFactor: () => number;
  getTradesByDate: (date: string) => Trade[];
  getDailyPnL: () => { date: string; pnl: number; cumulative: number }[];
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

// Sample data for demo
const sampleTrades: Trade[] = [
  {
    id: '1',
    date: '2023-10-10',
    symbol: 'EURUSD',
    side: 'long',
    entryPrice: 1.0580,
    exitPrice: 1.0650,
    quantity: 1.5,
    pnl: 1762.00,
    commission: 105.00,
    duration: 180,
    setup: 'Breakout',
    tags: ['FOMO'],
  },
  {
    id: '2',
    date: '2023-09-06',
    symbol: 'GBPUSD',
    side: 'long',
    entryPrice: 1.2480,
    exitPrice: 1.2580,
    quantity: 2.0,
    pnl: 3735.90,
    commission: 37.54,
    duration: 240,
    setup: 'Trend Follow',
  },
  {
    id: '3',
    date: '2023-08-25',
    symbol: 'USDCAD',
    side: 'short',
    entryPrice: 1.3620,
    exitPrice: 1.3580,
    quantity: 1.0,
    pnl: 167.31,
    commission: 38.58,
    duration: 90,
    setup: 'Reversal',
  },
  {
    id: '4',
    date: '2023-08-24',
    symbol: 'AUDUSD',
    side: 'long',
    entryPrice: 0.6420,
    exitPrice: 0.6350,
    quantity: 2.5,
    pnl: -993.68,
    commission: 45.00,
    duration: 120,
    mistakes: ['Early Entry'],
  },
  {
    id: '5',
    date: '2023-08-23',
    symbol: 'EURUSD',
    side: 'long',
    entryPrice: 1.0520,
    exitPrice: 1.0590,
    quantity: 1.0,
    pnl: 850.00,
    commission: 25.00,
    duration: 60,
    setup: 'Breakout',
  },
  {
    id: '6',
    date: '2023-08-22',
    symbol: 'GBPUSD',
    side: 'short',
    entryPrice: 1.2650,
    exitPrice: 1.2700,
    quantity: 1.5,
    pnl: -750.00,
    commission: 30.00,
    duration: 45,
    mistakes: ['No Stop Loss'],
  },
];

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>(sampleTrades);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: '2023-10-10',
      notes: 'Great trading day. Followed my plan and executed well on the EURUSD breakout.',
      mood: 'positive',
      lessons: 'Patience pays off. Wait for confirmation before entry.',
    },
    {
      id: '2',
      date: '2023-09-06',
      notes: 'Solid performance today. Both trades were winners.',
      mood: 'positive',
    },
  ]);

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

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    setJournalEntries(prev => [...prev, { ...entry, id: generateId() }]);
  }, []);

  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const importFromCSV = useCallback((csvContent: string, brokerFormat: string): { success: boolean; count: number; errors: string[] } => {
    const errors: string[] = [];
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return { success: false, count: 0, errors: ['CSV file is empty or has no data rows'] };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const newTrades: Omit<Trade, 'id'>[] = [];

    // Generic column mapping based on common broker formats
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

        // Parse date
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
          duration: 60, // Default duration
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

  return (
    <TradeContext.Provider value={{
      trades,
      journalEntries,
      addTrade,
      addTrades,
      updateTrade,
      deleteTrade,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      importFromCSV,
      getTotalPnL,
      getWinRate,
      getProfitFactor,
      getTradesByDate,
      getDailyPnL,
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
