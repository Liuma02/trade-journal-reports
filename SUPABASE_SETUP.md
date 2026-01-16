# Supabase Database Setup

Run these SQL scripts in your Supabase SQL Editor in order:

## 1. Create the `trades` table

```sql
-- Trades table for storing trading data
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
  entry_price DECIMAL(18, 8) NOT NULL,
  exit_price DECIMAL(18, 8) NOT NULL,
  quantity DECIMAL(18, 8) NOT NULL,
  pnl DECIMAL(18, 2) NOT NULL DEFAULT 0,
  commission DECIMAL(18, 2) NOT NULL DEFAULT 0,
  duration INTEGER DEFAULT 0,
  setup VARCHAR(100),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  mistakes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_trade_date ON public.trades(trade_date);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own trades
CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON public.trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## 2. Create the `journal_entries` table

```sql
-- Journal entries table for daily trading notes
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  notes TEXT,
  mood VARCHAR(20) CHECK (mood IN ('positive', 'neutral', 'negative')),
  lessons TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, trade_date)
);

-- Create index for faster queries
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_trade_date ON public.journal_entries(trade_date);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own journal entries
CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## 3. Create updated_at trigger function

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to trades table
CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Apply trigger to journal_entries table
CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

## Supabase Dashboard Settings

1. **Enable Email Auth**: Go to Authentication → Providers → Email and ensure it's enabled
2. **Configure Site URL**: Go to Authentication → URL Configuration and set your Site URL
3. **Disable Email Confirmation (optional for dev)**: Go to Authentication → Providers → Email → Toggle off "Confirm email"
