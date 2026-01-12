import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportTradeData } from "@/pages/Reports";

interface SummaryTableProps {
  data: ReportTradeData[];
  labelHeader: string;
}

export function SummaryTable({ data, labelHeader }: SummaryTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate summary stats for each row
  const summaryData = data.map(row => {
    const totalProfits = row.pnl > 0 ? row.pnl : 0;
    const totalLoss = row.pnl < 0 ? Math.abs(row.pnl) : 0;
    const winRate = row.trades > 0 && row.pnl > 0 ? Math.min(95, Math.round((row.pnl / (row.trades * 100)) * 100 + 50)) : row.pnl < 0 ? Math.max(5, 50 - Math.round(Math.abs(row.pnl) / (row.trades * 100) * 50)) : 0;
    
    return {
      ...row,
      netProfit: row.pnl,
      totalProfits,
      totalLoss,
      winRate: row.trades > 0 ? winRate : 0,
      volume: Math.round(row.trades * 2.5),
    };
  });

  return (
    <div className="chart-card animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">SUMMARY</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-medium">{labelHeader}</TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium text-right">Net Profit</TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium text-center">Winning %</TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium text-right">Total Profits</TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium text-right">Total Loss</TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium text-right">Trades</TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((row, index) => (
              <TableRow key={index} className="border-border hover:bg-secondary/50">
                <TableCell className="font-medium">
                  <span className="px-2 py-1 rounded bg-secondary text-xs">
                    {row.label}
                  </span>
                </TableCell>
                <TableCell className={`text-right text-sm ${row.netProfit >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatCurrency(row.netProfit)}
                </TableCell>
                <TableCell className="text-center">
                  {row.winRate > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${row.winRate >= 50 ? "bg-profit" : "bg-loss"}`}
                          style={{ width: `${row.winRate}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-profit">
                  {row.totalProfits > 0 ? formatCurrency(row.totalProfits) : formatCurrency(0)}
                </TableCell>
                <TableCell className="text-right text-sm text-loss">
                  {row.totalLoss > 0 ? formatCurrency(row.totalLoss) : formatCurrency(0)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {row.trades}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {row.volume}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
