import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/contexts/TradeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, ArrowUpDown, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SortField = 'date' | 'symbol' | 'pnl' | 'side';
type SortOrder = 'asc' | 'desc';

const TradesPage = () => {
  const { trades, deleteTrade } = useTrades();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedTrades = trades
    .filter(trade => 
      trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.side.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.setup?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'pnl':
          comparison = a.pnl - b.pnl;
          break;
        case 'side':
          comparison = a.side.localeCompare(b.side);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+$' : '-$';
    return `${prefix}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const totalPnL = filteredAndSortedTrades.reduce((sum, t) => sum + t.pnl - t.commission, 0);
  const totalCommissions = filteredAndSortedTrades.reduce((sum, t) => sum + t.commission, 0);

  return (
    <AppLayout title="Trades" showFilters>
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold">{filteredAndSortedTrades.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Net P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(totalPnL)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Commissions</p>
              <p className="text-2xl font-bold text-muted-foreground">
                ${totalCommissions.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold text-profit">
                {filteredAndSortedTrades.length > 0 
                  ? ((filteredAndSortedTrades.filter(t => t.pnl > 0).length / filteredAndSortedTrades.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Trade Log</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search trades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('date')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('symbol')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Symbol
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('side')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Side
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Entry</TableHead>
                    <TableHead className="text-right">Exit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('pnl')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Net P&L
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTrades.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-muted/30">
                      <TableCell>
                        {new Date(trade.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-muted rounded text-sm font-medium">
                          {trade.symbol}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.side === 'long' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
                        }`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {trade.entryPrice.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {trade.exitPrice.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">{trade.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDuration(trade.duration)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(trade.pnl - trade.commission)}
                      </TableCell>
                      <TableCell>
                        {trade.setup && (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                            {trade.setup}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-loss">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this trade? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteTrade(trade.id)}
                                className="bg-loss hover:bg-loss/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TradesPage;
