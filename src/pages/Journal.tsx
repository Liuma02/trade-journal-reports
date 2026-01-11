import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades, Trade } from "@/contexts/TradeContext";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Edit2, Save, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
interface DayData {
  date: string;
  trades: Trade[];
  totalPnL: number;
  grossPnL: number;
  commissions: number;
  winners: number;
  losers: number;
  volume: number;
  winRate: number;
  profitFactor: number;
}

const Journal = () => {
  const { trades, journalEntries, addJournalEntry, updateJournalEntry } = useTrades();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  if (trades.length === 0) {
    return (
      <AppLayout title="Daily Journal" showFilters>
        <EmptyState type="journal" />
      </AppLayout>
    );
  }
  // Group trades by date
  const tradesByDate = trades.reduce((acc, trade) => {
    if (!acc[trade.date]) {
      acc[trade.date] = [];
    }
    acc[trade.date].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  // Calculate day data
  const dayDataList: DayData[] = Object.entries(tradesByDate)
    .map(([date, dayTrades]) => {
      const grossPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
      const commissions = dayTrades.reduce((sum, t) => sum + t.commission, 0);
      const totalPnL = grossPnL - commissions;
      const winners = dayTrades.filter(t => t.pnl > 0).length;
      const losers = dayTrades.filter(t => t.pnl <= 0).length;
      const volume = dayTrades.reduce((sum, t) => sum + t.quantity, 0);
      const winRate = dayTrades.length > 0 ? (winners / dayTrades.length) * 100 : 0;
      const profits = dayTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
      const losses = Math.abs(dayTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
      const profitFactor = losses > 0 ? profits / losses : profits > 0 ? Infinity : 0;

      return {
        date,
        trades: dayTrades,
        totalPnL,
        grossPnL,
        commissions,
        winners,
        losers,
        volume,
        winRate,
        profitFactor,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '$' : '-$';
    return `${prefix}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getJournalEntry = (date: string) => {
    return journalEntries.find(e => e.date === date);
  };

  const startEditingNote = (date: string) => {
    const entry = getJournalEntry(date);
    setEditingNote(date);
    setNoteText(entry?.notes || "");
  };

  const saveNote = (date: string) => {
    const existingEntry = getJournalEntry(date);
    if (existingEntry) {
      updateJournalEntry(existingEntry.id, { notes: noteText });
    } else {
      addJournalEntry({ date, notes: noteText });
    }
    setEditingNote(null);
    setNoteText("");
  };

  const getCumulativePnLData = (dayTrades: Trade[]) => {
    let cumulative = 0;
    return dayTrades
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((trade, idx) => {
        cumulative += trade.pnl - trade.commission;
        return {
          trade: idx + 1,
          pnl: cumulative,
        };
      });
  };

  return (
    <AppLayout title="Daily Journal" showFilters>
      <div className="p-6 space-y-4">
        {dayDataList.map((day) => {
          const isExpanded = expandedDays.has(day.date);
          const journalEntry = getJournalEntry(day.date);
          const chartData = getCumulativePnLData(day.trades);

          return (
            <Card key={day.date} className="bg-card border-border overflow-hidden">
              {/* Day Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleDay(day.date)}
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <span className="font-semibold">{formatDate(day.date)}</span>
                    <span className="mx-3">•</span>
                    <span className={`font-semibold ${day.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                      Net P&L {formatCurrency(day.totalPnL)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingNote !== day.date ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingNote(day.date);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      {journalEntry ? 'Edit Note' : 'Add Note'}
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="border-t border-border p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Chart */}
                    <div className="lg:col-span-4 p-4 border-r border-border">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id={`gradient-${day.date}`} x1="0" y1="0" x2="0" y2="1">
                                <stop 
                                  offset="5%" 
                                  stopColor={day.totalPnL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} 
                                  stopOpacity={0.3}
                                />
                                <stop 
                                  offset="95%" 
                                  stopColor={day.totalPnL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} 
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="trade" hide />
                            <YAxis hide />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                              formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
                            />
                            <Area
                              type="monotone"
                              dataKey="pnl"
                              stroke={day.totalPnL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                              strokeWidth={2}
                              fill={`url(#gradient-${day.date})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Intraday Cumulative Net P&L
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-8 p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Trades</p>
                          <p className="text-lg font-semibold">{day.trades.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Winners</p>
                          <p className="text-lg font-semibold text-profit">{day.winners}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gross P&L</p>
                          <p className={`text-lg font-semibold ${day.grossPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {formatCurrency(day.grossPnL)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commissions</p>
                          <p className="text-lg font-semibold">{formatCurrency(day.commissions)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Winrate</p>
                          <p className="text-lg font-semibold">{day.winRate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Losers</p>
                          <p className="text-lg font-semibold text-loss">{day.losers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="text-lg font-semibold">{day.volume.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Profit Factor</p>
                          <p className="text-lg font-semibold">
                            {day.profitFactor === Infinity ? '--' : day.profitFactor.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Note Section */}
                      {(editingNote === day.date || journalEntry) && (
                        <div className="mt-4 pt-4 border-t border-border">
                          {editingNote === day.date ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Write your notes for this trading day..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="min-h-[100px]"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveNote(day.date);
                                  }}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNote(null);
                                  }}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : journalEntry ? (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm">{journalEntry.notes}</p>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {dayDataList.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No trades yet. Import your trade history to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Journal;
