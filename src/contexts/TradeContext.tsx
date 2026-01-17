import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as tradesService from '@/services/tradesService'
import * as journalService from '@/services/journalService'
import { useToast } from '@/hooks/use-toast'

/* =========================
   TYPES
========================= */

export interface Trade {
  id: string
  date: string
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  commission: number
  duration: number
  setup?: string
  notes?: string
  tags: string[]
  mistakes: string[]
}

export interface JournalEntry {
  id: string
  date: string
  notes: string
  mood?: 'positive' | 'neutral' | 'negative'
  lessons?: string
}

interface TradeContextType {
  trades: Trade[]
  journalEntries: JournalEntry[]
  customTags: string[]
  isLoading: boolean
  addTrade(trade: Omit<Trade, 'id'>): Promise<void>
  addTrades(trades: Omit<Trade, 'id'>[]): Promise<void>
  updateTrade(id: string, trade: Partial<Trade>): Promise<void>
  deleteTrade(id: string): Promise<void>
  clearAllTrades(): Promise<void>
  addJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<void>
  updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<void>
  deleteJournalEntry(id: string): Promise<void>
  addCustomTag(tag: string): void
  removeCustomTag(tag: string): void
  importFromCSV(
    csvContent: string,
    brokerFormat: string
  ): Promise<{ success: boolean; count: number; errors: string[] }>
  refreshData(): Promise<void>
  getTotalPnL(): number
  getWinRate(): number
  getProfitFactor(): number
  getTradesByDate(date: string): Trade[]
  getDailyPnL(): { date: string; pnl: number; cumulative: number }[]
  getMaxDrawdown(): number
  getAverageRR(): number
  getPerformanceByTag(): {
    tag: string
    pnl: number
    count: number
    winRate: number
  }[]
  getPerformanceBySymbol(): {
    symbol: string
    pnl: number
    count: number
    winRate: number
  }[]
  getBestWorstTrades(): { best: Trade | null; worst: Trade | null }
  getStreaks(): {
    currentStreak: number
    longestWinStreak: number
    longestLossStreak: number
  }
}

const TradeContext = createContext<TradeContextType | undefined>(undefined)

const DEFAULT_TAGS = [
  'FOMO',
  'REVENGE',
  'OVERSIZE',
  'PATIENCE',
  'BREAKOUT',
  'TREND',
  'REVERSAL',
  'NEWS',
]

/* =========================
   HELPERS
========================= */

const uuid = () => crypto.randomUUID()

const dbRowToTrade = (row: any): Trade => ({
  id: row.id,
  date: row.trade_date,
  symbol: row.symbol,
  side: row.side,
  entryPrice: Number(row.entry_price),
  exitPrice: Number(row.exit_price),
  quantity: Number(row.quantity),
  pnl: Number(row.pnl),
  commission: Number(row.commission),
  duration: row.duration ?? 0,
  setup: row.setup ?? undefined,
  notes: row.notes ?? undefined,
  tags: row.tags ?? [],
  mistakes: row.mistakes ?? [],
})

const tradeToDbRow = (trade: Omit<Trade, 'id'>, userId: string) => ({
  user_id: userId, // matches RLS auth.uid()
  trade_date: trade.date,
  symbol: trade.symbol,
  side: trade.side,
  entry_price: trade.entryPrice,
  exit_price: trade.exitPrice,
  quantity: trade.quantity,
  pnl: trade.pnl,
  commission: trade.commission,
  duration: trade.duration,
  setup: trade.setup ?? null,
  notes: trade.notes ?? null,
  tags: trade.tags ?? [],
  mistakes: trade.mistakes ?? [],
})

const dbRowToJournalEntry = (row: any): JournalEntry => ({
  id: row.id,
  date: row.trade_date,
  notes: row.notes ?? '',
  mood: row.mood ?? undefined,
  lessons: row.lessons ?? undefined,
})

const journalEntryToDbRow = (
  entry: Omit<JournalEntry, 'id'>,
  userId: string
) => ({
  user_id: userId,
  trade_date: entry.date,
  notes: entry.notes,
  mood: entry.mood ?? null,
  lessons: entry.lessons ?? null,
})

/* =========================
   PROVIDER
========================= */

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [trades, setTrades] = useState<Trade[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [customTags, setCustomTags] = useState<string[]>(DEFAULT_TAGS)
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()
  const isConfigured = isSupabaseConfigured()

  /* =========================
     DATA LOADING
  ========================= */

  const refreshData = useCallback(async () => {
    if (!isConfigured || !user) {
      setTrades([])
      setJournalEntries([])
      return
    }

    setIsLoading(true)
    try {
      const [tradesRes, journalRes] = await Promise.all([
        tradesService.fetchTrades(),
        journalService.fetchJournalEntries(),
      ])

      if (tradesRes.data)
        setTrades(tradesRes.data.map(dbRowToTrade))
      if (journalRes.data)
        setJournalEntries(journalRes.data.map(dbRowToJournalEntry))
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [isConfigured, user, toast])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  /* =========================
     STATS (FIXED)
  ========================= */

  const getTotalPnL = useCallback(
    () => trades.reduce((s, t) => s + t.pnl - t.commission, 0),
    [trades]
  )

  const getWinRate = useCallback(() => {
    if (!trades.length) return 0
    return (trades.filter(t => t.pnl > 0).length / trades.length) * 100
  }, [trades])

  const getStreaks = useCallback(() => {
    let win = 0
    let loss = 0
    let maxWin = 0
    let maxLoss = 0

    const sorted = [...trades].sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    )

    sorted.forEach(t => {
      if (t.pnl > 0) {
        win++
        loss = 0
        maxWin = Math.max(maxWin, win)
      } else if (t.pnl < 0) {
        loss++
        win = 0
        maxLoss = Math.max(maxLoss, loss)
      }
    })

    const last = sorted.at(-1)
    const currentStreak = last
      ? last.pnl > 0
        ? win
        : last.pnl < 0
        ? -loss
        : 0
      : 0

    return {
      currentStreak,
      longestWinStreak: maxWin,
      longestLossStreak: maxLoss,
    }
  }, [trades])

  /* ========================= */

  return (
    <TradeContext.Provider
      value={{
        trades,
        journalEntries,
        customTags,
        isLoading,
        refreshData,
        getTotalPnL,
        getWinRate,
        getStreaks,
      }}
    >
      {children}
    </TradeContext.Provider>
  )
}

export const useTrades = () => {
  const ctx = useContext(TradeContext)
  if (!ctx) throw new Error('useTrades must be used within TradeProvider')
  return ctx
}
