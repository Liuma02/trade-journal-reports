/**
 * Database Type Definitions
 * 
 * These types represent the structure of our Supabase tables.
 * They are used for type-safe database operations.
 */

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: TradeRow;
        Insert: TradeInsert;
        Update: TradeUpdate;
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: JournalEntryInsert;
        Update: JournalEntryUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trade_direction: 'long' | 'short';
    };
  };
}

/**
 * Trade table row type
 * Represents a single trade record in the database
 */
export interface TradeRow {
  id: string;
  user_id: string;
  instrument: string;
  direction: 'long' | 'short';
  size: number;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  trade_date: string;
  entry_time: string | null;
  exit_time: string | null;
  duration_seconds: number | null;
  position_id: string | null;
  setup: string | null;
  pnl: number | null;
  commission: number | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Trade insert type - fields required when creating a new trade
 */
export interface TradeInsert {
  id?: string;
  user_id: string;
  instrument: string;
  direction: 'long' | 'short';
  size: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  trade_date: string;
  entry_time?: string | null;
  exit_time?: string | null;
  duration_seconds?: number | null;
  position_id?: string | null;
  setup?: string | null;
  pnl?: number | null;
  commission?: number | null;
  tags?: string[] | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Trade update type - all fields are optional for partial updates
 */
export interface TradeUpdate {
  instrument?: string;
  direction?: 'long' | 'short';
  size?: number;
  entry_price?: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  trade_date?: string;
  entry_time?: string | null;
  exit_time?: string | null;
  duration_seconds?: number | null;
  position_id?: string | null;
  setup?: string | null;
  pnl?: number | null;
  commission?: number | null;
  tags?: string[] | null;
  notes?: string | null;
  updated_at?: string;
}

/**
 * Journal entry table row type
 * Represents a daily trading journal entry
 */
export interface JournalEntryRow {
  id: string;
  user_id: string;
  trade_date: string;
  content: string;
  mood: string | null;
  lessons: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Journal entry insert type
 */
export interface JournalEntryInsert {
  id?: string;
  user_id: string;
  trade_date: string;
  content: string;
  mood?: string | null;
  lessons?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Journal entry update type
 */
export interface JournalEntryUpdate {
  trade_date?: string;
  content?: string;
  mood?: string | null;
  lessons?: string | null;
  updated_at?: string;
}

/**
 * Frontend Trade type - used in the UI
 * This maps database fields to the existing frontend structure
 */
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

/**
 * Frontend Journal Entry type - used in the UI
 */
export interface JournalEntry {
  id: string;
  date: string;
  notes: string;
  mood?: 'positive' | 'neutral' | 'negative';
  lessons?: string;
}

/**
 * Helper functions to convert between database and frontend types
 */
export function tradeRowToTrade(row: TradeRow): Trade {
  return {
    id: row.id,
    date: row.trade_date,
    symbol: row.instrument,
    side: row.direction,
    entryPrice: row.entry_price,
    exitPrice: row.exit_price ?? row.entry_price,
    quantity: row.size,
    pnl: row.pnl ?? 0,
    commission: row.commission ?? 0,
    duration: row.duration_seconds ? Math.floor(row.duration_seconds / 60) : 0,
    setup: row.setup ?? undefined,
    notes: row.notes ?? undefined,
    tags: row.tags ?? undefined,
  };
}

export function tradeToTradeInsert(trade: Omit<Trade, 'id'>, userId: string): TradeInsert {
  return {
    user_id: userId,
    instrument: trade.symbol,
    direction: trade.side,
    size: trade.quantity,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    trade_date: trade.date,
    duration_seconds: trade.duration ? trade.duration * 60 : null,
    setup: trade.setup ?? null,
    pnl: trade.pnl,
    commission: trade.commission,
    tags: trade.tags ?? null,
    notes: trade.notes ?? null,
  };
}

export function journalRowToJournalEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    date: row.trade_date,
    notes: row.content,
    mood: row.mood as JournalEntry['mood'],
    lessons: row.lessons ?? undefined,
  };
}

export function journalEntryToInsert(entry: Omit<JournalEntry, 'id'>, userId: string): JournalEntryInsert {
  return {
    user_id: userId,
    trade_date: entry.date,
    content: entry.notes,
    mood: entry.mood ?? null,
    lessons: entry.lessons ?? null,
  };
}
