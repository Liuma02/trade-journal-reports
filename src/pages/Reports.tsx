import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterTabs } from "@/components/reports/FilterTabs";
import { DistributionChart } from "@/components/reports/DistributionChart";
import { PerformanceChart } from "@/components/reports/PerformanceChart";
import { SummaryTable } from "@/components/reports/SummaryTable";
import { SubFilters } from "@/components/reports/SubFilters";
import { PnlToggle } from "@/components/reports/PnlToggle";
import { EmptyState } from "@/components/EmptyState";
import { useTrades } from "@/contexts/TradeContext";
import { FilterCategory, filterCategories, getCategoryTitle } from "@/data/mockTradeData";

export interface ReportTradeData {
  label: string;
  trades: number;
  pnl: number;
}

const Reports = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("instrument");
  const [pnlType, setPnlType] = useState<"net" | "gross">("net");
  const { trades } = useTrades();

  const data = useMemo((): ReportTradeData[] => {
    if (trades.length === 0) return [];

    const aggregateByKey = (keyFn: (trade: typeof trades[0]) => string): ReportTradeData[] => {
      const map = new Map<string, { trades: number; pnl: number }>();
      
      trades.forEach(trade => {
        const key = keyFn(trade);
        const current = map.get(key) || { trades: 0, pnl: 0 };
        const pnlValue = pnlType === "net" ? trade.pnl - trade.commission : trade.pnl;
        map.set(key, {
          trades: current.trades + 1,
          pnl: current.pnl + pnlValue,
        });
      });

      return Array.from(map.entries())
        .map(([label, stats]) => ({ label, ...stats }))
        .sort((a, b) => b.pnl - a.pnl);
    };

    switch (activeFilter) {
      case "instrument":
        return aggregateByKey(t => t.symbol);

      case "days": {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return aggregateByKey(t => dayNames[new Date(t.date).getDay()]);
      }

      case "weeks": {
        return aggregateByKey(t => {
          const date = new Date(t.date);
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
          return `Week ${weekNumber}`;
        });
      }

      case "months": {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return aggregateByKey(t => monthNames[new Date(t.date).getMonth()]);
      }

      case "time": {
        return aggregateByKey(t => {
          const hour = new Date(t.date).getHours();
          return `${hour.toString().padStart(2, '0')}:00`;
        });
      }

      case "duration": {
        return aggregateByKey(t => {
          const mins = t.duration;
          if (mins < 1) return "Under 1 min";
          if (mins < 5) return "1-5 min";
          if (mins < 15) return "5-15 min";
          if (mins < 30) return "15-30 min";
          if (mins < 60) return "30-60 min";
          if (mins < 120) return "1-2 hours";
          return "2+ hours";
        });
      }

      case "price": {
        return aggregateByKey(t => {
          const price = t.entryPrice;
          if (price < 10) return "$0 - $10";
          if (price < 50) return "$10 - $50";
          if (price < 100) return "$50 - $100";
          if (price < 500) return "$100 - $500";
          return "$500+";
        });
      }

      case "volume": {
        return aggregateByKey(t => {
          const qty = t.quantity;
          if (qty < 0.1) return "0.01 - 0.1";
          if (qty < 0.5) return "0.1 - 0.5";
          if (qty < 1) return "0.5 - 1.0";
          if (qty < 5) return "1.0 - 5.0";
          return "5.0+";
        });
      }

      case "setups": {
        return aggregateByKey(t => t.setup || "No Setup");
      }

      case "mistakes": {
        const mistakeMap = new Map<string, { trades: number; pnl: number }>();
        trades.forEach(trade => {
          (trade.mistakes || []).forEach(mistake => {
            const current = mistakeMap.get(mistake) || { trades: 0, pnl: 0 };
            const pnlValue = pnlType === "net" ? trade.pnl - trade.commission : trade.pnl;
            mistakeMap.set(mistake, {
              trades: current.trades + 1,
              pnl: current.pnl + pnlValue,
            });
          });
        });
        return Array.from(mistakeMap.entries())
          .map(([label, stats]) => ({ label, ...stats }))
          .sort((a, b) => b.pnl - a.pnl);
      }

      case "tags": {
        const tagMap = new Map<string, { trades: number; pnl: number }>();
        trades.forEach(trade => {
          (trade.tags || []).forEach(tag => {
            const current = tagMap.get(tag) || { trades: 0, pnl: 0 };
            const pnlValue = pnlType === "net" ? trade.pnl - trade.commission : trade.pnl;
            tagMap.set(tag, {
              trades: current.trades + 1,
              pnl: current.pnl + pnlValue,
            });
          });
        });
        return Array.from(tagMap.entries())
          .map(([label, stats]) => ({ label, ...stats }))
          .sort((a, b) => b.pnl - a.pnl);
      }

      case "sector": {
        return aggregateByKey(t => {
          const symbol = t.symbol.toUpperCase();
          if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'].includes(symbol)) return 'Forex';
          if (['BTC', 'ETH', 'BTCUSD', 'ETHUSD', 'XRP', 'SOL'].includes(symbol)) return 'Crypto';
          if (['SPX', 'NDX', 'DJI', 'US30', 'NAS100', 'SPY', 'QQQ'].includes(symbol)) return 'Indices';
          if (['XAUUSD', 'GOLD', 'SILVER', 'OIL', 'USOIL'].includes(symbol)) return 'Commodities';
          return 'Stocks';
        });
      }

      default:
        return aggregateByKey(t => t.side === 'long' ? 'Long' : 'Short');
    }
  }, [trades, activeFilter, pnlType]);

  const categoryTitle = getCategoryTitle(activeFilter);

  if (trades.length === 0) {
    return (
      <AppLayout title="Reports">
        <div className="p-6">
          <EmptyState type="reports" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Reports">
      <div className="p-6">
        <PnlToggle value={pnlType} onChange={setPnlType} />
        
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        <SubFilters activeFilter={activeFilter} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DistributionChart 
            title={`TRADE DISTRIBUTION BY ${categoryTitle}`}
            subtitle="(ALL DATES)"
            data={data}
          />
          <PerformanceChart 
            title={`PERFORMANCE BY ${categoryTitle}`}
            subtitle="(ALL DATES)"
            data={data}
          />
        </div>

        <div className="mt-6">
          <SummaryTable data={data} labelHeader={categoryTitle} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
