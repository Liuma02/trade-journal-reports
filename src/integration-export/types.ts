// Trade Data Types for Reports

export interface TradeData {
  label: string;
  trades: number;
  pnl: number;
}

export interface SummaryRow {
  label: string;
  netProfit: number;
  winRate: number;
  totalProfits: number;
  totalLoss: number;
  trades: number;
  volume: number;
}

export type FilterCategory =
  | "days"
  | "weeks"
  | "months"
  | "time"
  | "duration"
  | "price"
  | "volume"
  | "instrument"
  | "sector"
  | "setups"
  | "mistakes"
  | "tags"
  | "other";

export interface FilterCategoryConfig {
  id: FilterCategory;
  label: string;
}
