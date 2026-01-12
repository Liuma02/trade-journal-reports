import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/contexts/TradeContext";
import { EmptyState } from "@/components/EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CalendarPage = () => {
  const { trades, getTradesByDate } = useTrades();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (trades.length === 0) {
    return (
      <AppLayout title="Calendar">
        <EmptyState type="calendar" />
      </AppLayout>
    );
  }
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDayData = (day: number) => {
    const dateStr = formatDate(day);
    const dayTrades = getTradesByDate(dateStr);
    const totalPnL = dayTrades.reduce((sum, t) => sum + t.pnl - t.commission, 0);
    const tags = [...new Set(dayTrades.flatMap(t => t.tags || []).concat(dayTrades.flatMap(t => t.setup ? [t.setup] : [])))];
    return { trades: dayTrades, totalPnL, tags };
  };

  const getTotalMonthPnL = () => {
    return trades
      .filter(t => {
        const tradeDate = new Date(t.date);
        return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.pnl - t.commission, 0);
  };

  const getWeekPnL = (weekStart: number) => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const day = weekStart + i;
      if (day > 0 && day <= daysInMonth) {
        const { totalPnL } = getDayData(day);
        total += totalPnL;
      }
    }
    return total;
  };

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '$' : '-$';
    return `${prefix}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalMonthPnL = getTotalMonthPnL();

  // Generate calendar grid
  const weeks: number[][] = [];
  let currentWeek: number[] = [];
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < startingDay; i++) {
    currentWeek.push(0);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(0);
    }
    weeks.push(currentWeek);
  }

  return (
    <AppLayout title="Calendar">
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <span className={`font-semibold ${totalMonthPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(totalMonthPnL)}
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-8 border-b border-border">
            {weekdays.map(day => (
              <div key={day} className="py-3 px-2 text-center text-sm font-medium text-muted-foreground bg-muted/30">
                {day}
              </div>
            ))}
            <div className="py-3 px-2 text-center text-sm font-medium text-muted-foreground bg-muted/30">
              WEEK P&L
            </div>
          </div>

          {/* Calendar Days */}
          {weeks.map((week, weekIndex) => {
            const firstDayOfWeek = week.find(d => d > 0) || 0;
            const weekPnL = getWeekPnL(firstDayOfWeek);
            const weekTrades = week.reduce((sum, day) => {
              if (day > 0) {
                return sum + getDayData(day).trades.length;
              }
              return sum;
            }, 0);

            return (
              <div key={weekIndex} className="grid grid-cols-8 border-b border-border last:border-b-0">
                {week.map((day, dayIndex) => {
                  if (day === 0) {
                    return <div key={dayIndex} className="min-h-[120px] bg-muted/10" />;
                  }

                  const { trades: dayTrades, totalPnL, tags } = getDayData(day);
                  const hasTrades = dayTrades.length > 0;
                  const isProfit = totalPnL > 0;
                  const isLoss = totalPnL < 0;

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[120px] p-2 border-r border-border last:border-r-0 transition-colors cursor-pointer hover:bg-muted/20 ${
                        hasTrades 
                          ? isProfit 
                            ? 'bg-profit/10' 
                            : isLoss 
                              ? 'bg-loss/10' 
                              : '' 
                          : ''
                      }`}
                    >
                      <div className="text-sm text-muted-foreground mb-1">{day}</div>
                      {hasTrades && (
                        <div className="space-y-1">
                          <div className={`text-sm font-semibold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                            {formatCurrency(totalPnL)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dayTrades.length} Trade{dayTrades.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.slice(0, 2).map((tag, i) => (
                              <span 
                                key={i} 
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  tag === 'FOMO' || tag === 'Early Entry' || tag === 'No Stop Loss'
                                    ? 'bg-loss/20 text-loss'
                                    : 'bg-profit/20 text-profit'
                                }`}
                              >
                                {tag.toUpperCase()}
                              </span>
                            ))}
                            {tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{tags.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Week P&L */}
                <div className={`min-h-[120px] p-2 flex flex-col justify-center items-center ${weekPnL !== 0 ? (weekPnL > 0 ? 'bg-profit/5' : 'bg-loss/5') : ''}`}>
                  {weekTrades > 0 && (
                    <>
                      <div className={`text-sm font-semibold ${weekPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(weekPnL)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {weekTrades} Trade{weekTrades !== 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
