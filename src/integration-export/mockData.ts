import { TradeData, FilterCategory, FilterCategoryConfig } from './types';

// Filter Categories
export const filterCategories: FilterCategoryConfig[] = [
  { id: "days", label: "DAYS" },
  { id: "weeks", label: "WEEKS" },
  { id: "months", label: "MONTHS" },
  { id: "time", label: "TIME" },
  { id: "duration", label: "TRADE DURATION" },
  { id: "price", label: "PRICE" },
  { id: "volume", label: "VOLUME" },
  { id: "instrument", label: "INSTRUMENT" },
  { id: "sector", label: "SECTOR" },
  { id: "setups", label: "SETUPS" },
  { id: "mistakes", label: "MISTAKES" },
  { id: "tags", label: "TAGS" },
  { id: "other", label: "OTHER" },
];

// Mock Data for each category
export const timeDistributionData: TradeData[] = [
  { label: "0:00", trades: 0, pnl: 0 },
  { label: "1:00", trades: 5, pnl: 450 },
  { label: "2:00", trades: 1, pnl: -120 },
  { label: "3:00", trades: 0, pnl: 0 },
  { label: "4:00", trades: 0, pnl: 0 },
  { label: "5:00", trades: 0, pnl: 0 },
  { label: "6:00", trades: 2, pnl: 280 },
  { label: "7:00", trades: 3, pnl: -450 },
  { label: "8:00", trades: 4, pnl: 890 },
  { label: "9:00", trades: 4, pnl: 1250 },
  { label: "10:00", trades: 3, pnl: -680 },
  { label: "11:00", trades: 3, pnl: 520 },
  { label: "12:00", trades: 2, pnl: 340 },
  { label: "13:00", trades: 1, pnl: -1607 },
  { label: "14:00", trades: 2, pnl: 890 },
  { label: "15:00", trades: 4, pnl: 1450 },
  { label: "16:00", trades: 5, pnl: 2100 },
  { label: "17:00", trades: 3, pnl: -320 },
  { label: "18:00", trades: 0, pnl: 0 },
  { label: "19:00", trades: 0, pnl: 0 },
  { label: "20:00", trades: 2, pnl: 560 },
  { label: "21:00", trades: 1, pnl: 230 },
  { label: "22:00", trades: 0, pnl: 0 },
  { label: "23:00", trades: 0, pnl: 0 },
];

export const durationDistributionData: TradeData[] = [
  { label: "Under 1 min", trades: 0, pnl: 0 },
  { label: "1:00 to 1:59", trades: 0, pnl: 0 },
  { label: "2:00 to 4:59", trades: 0, pnl: 0 },
  { label: "5:00 to 9:59", trades: 1, pnl: -110 },
  { label: "10:00 to 29:59", trades: 3, pnl: -1850 },
  { label: "30:00 to 59:59", trades: 4, pnl: -2100 },
  { label: "1:00:00 to 1:59:59", trades: 5, pnl: -2450 },
  { label: "2:00:00 to 3:59:59", trades: 4, pnl: 4490 },
  { label: "4:00:00 and over", trades: 3, pnl: 3200 },
];

export const instrumentDistributionData: TradeData[] = [
  { label: "EURUSD", trades: 19, pnl: 2272 },
  { label: "GBPUSD", trades: 6, pnl: 2026 },
  { label: "USDCAD", trades: 1, pnl: 1659 },
  { label: "AUDUSD", trades: 4, pnl: -1024 },
];

export const dayDistributionData: TradeData[] = [
  { label: "Monday", trades: 8, pnl: 1250 },
  { label: "Tuesday", trades: 12, pnl: 2340 },
  { label: "Wednesday", trades: 6, pnl: -890 },
  { label: "Thursday", trades: 9, pnl: 1560 },
  { label: "Friday", trades: 5, pnl: 780 },
];

export const weekDistributionData: TradeData[] = [
  { label: "Week 1", trades: 10, pnl: 1850 },
  { label: "Week 2", trades: 8, pnl: -420 },
  { label: "Week 3", trades: 12, pnl: 2100 },
  { label: "Week 4", trades: 10, pnl: 1520 },
];

export const monthDistributionData: TradeData[] = [
  { label: "January", trades: 45, pnl: 4250 },
  { label: "February", trades: 38, pnl: 2890 },
  { label: "March", trades: 52, pnl: -1240 },
  { label: "April", trades: 41, pnl: 3560 },
  { label: "May", trades: 48, pnl: 2100 },
  { label: "June", trades: 35, pnl: 1890 },
];

export const priceDistributionData: TradeData[] = [
  { label: "$0 - $50", trades: 15, pnl: 890 },
  { label: "$50 - $100", trades: 22, pnl: 2450 },
  { label: "$100 - $200", trades: 18, pnl: 1680 },
  { label: "$200 - $500", trades: 10, pnl: -890 },
  { label: "$500+", trades: 5, pnl: 1250 },
];

export const volumeDistributionData: TradeData[] = [
  { label: "0.01 - 0.1", trades: 20, pnl: 1250 },
  { label: "0.1 - 0.5", trades: 35, pnl: 3450 },
  { label: "0.5 - 1.0", trades: 15, pnl: 890 },
  { label: "1.0 - 2.0", trades: 8, pnl: -560 },
  { label: "2.0+", trades: 2, pnl: -1200 },
];

export const sectorDistributionData: TradeData[] = [
  { label: "Forex", trades: 45, pnl: 4890 },
  { label: "Crypto", trades: 15, pnl: -1250 },
  { label: "Indices", trades: 12, pnl: 2100 },
  { label: "Commodities", trades: 8, pnl: 560 },
];

export const setupDistributionData: TradeData[] = [
  { label: "Breakout", trades: 22, pnl: 3450 },
  { label: "Pullback", trades: 18, pnl: 2100 },
  { label: "Reversal", trades: 15, pnl: -890 },
  { label: "Trend Follow", trades: 25, pnl: 4200 },
];

export const mistakeDistributionData: TradeData[] = [
  { label: "Early Entry", trades: 12, pnl: -1850 },
  { label: "Late Exit", trades: 8, pnl: -1200 },
  { label: "Wrong Size", trades: 5, pnl: -890 },
  { label: "No Stop Loss", trades: 3, pnl: -2100 },
  { label: "FOMO", trades: 7, pnl: -1450 },
];

export const tagDistributionData: TradeData[] = [
  { label: "High Conviction", trades: 30, pnl: 5200 },
  { label: "Scalp", trades: 25, pnl: 1890 },
  { label: "Swing", trades: 15, pnl: 2450 },
  { label: "News Trade", trades: 10, pnl: -560 },
];

// Helper functions
export function getDataForCategory(category: FilterCategory): TradeData[] {
  const dataMap: Record<FilterCategory, TradeData[]> = {
    days: dayDistributionData,
    weeks: weekDistributionData,
    months: monthDistributionData,
    time: timeDistributionData,
    duration: durationDistributionData,
    price: priceDistributionData,
    volume: volumeDistributionData,
    instrument: instrumentDistributionData,
    sector: sectorDistributionData,
    setups: setupDistributionData,
    mistakes: mistakeDistributionData,
    tags: tagDistributionData,
    other: timeDistributionData,
  };
  return dataMap[category] || timeDistributionData;
}

export function getCategoryTitle(category: FilterCategory): string {
  const titleMap: Record<FilterCategory, string> = {
    days: "DAY",
    weeks: "WEEK",
    months: "MONTH",
    time: "HOUR",
    duration: "INTRADAY DURATION",
    price: "PRICE RANGE",
    volume: "VOLUME",
    instrument: "SYMBOLS",
    sector: "SECTOR",
    setups: "SETUP",
    mistakes: "MISTAKE",
    tags: "TAG",
    other: "OTHER",
  };
  return titleMap[category] || "OTHER";
}
