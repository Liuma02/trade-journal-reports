import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrades } from "@/contexts/TradeContext";
import { TrendingUp, TrendingDown, Target, DollarSign, Calendar, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const { trades, getTotalPnL, getWinRate, getProfitFactor, getDailyPnL } = useTrades();
  
  const totalPnL = getTotalPnL();
  const winRate = getWinRate();
  const profitFactor = getProfitFactor();
  const dailyPnL = getDailyPnL();

  const winners = trades.filter(t => t.pnl > 0).length;
  const losers = trades.filter(t => t.pnl <= 0).length;

  const avgWinner = winners > 0 
    ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winners 
    : 0;
  const avgLoser = losers > 0 
    ? Math.abs(trades.filter(t => t.pnl <= 0).reduce((sum, t) => sum + t.pnl, 0) / losers)
    : 0;

  const winRateData = [
    { name: 'Winners', value: winners, color: 'hsl(var(--profit))' },
    { name: 'Losers', value: losers, color: 'hsl(var(--loss))' },
  ];

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AppLayout title="Dashboard" showFilters>
      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Net P&L</p>
                  <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(totalPnL)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trades in total: {trades.length}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${totalPnL >= 0 ? 'bg-profit/20' : 'bg-loss/20'}`}>
                  <DollarSign className={`w-6 h-6 ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Factor</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/20">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Winner</p>
                  <p className="text-2xl font-bold text-profit">
                    {formatCurrency(avgWinner)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-profit/20">
                  <TrendingUp className="w-6 h-6 text-profit" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Loser</p>
                  <p className="text-2xl font-bold text-loss">
                    -${avgLoser.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-loss/20">
                  <TrendingDown className="w-6 h-6 text-loss" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Win Rate Pie Charts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Winning % By Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winRateData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {winRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-profit">{winRate.toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground">WINRATE</span>
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-profit" />
                    <span className="text-sm">{winners} winners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-loss" />
                    <span className="text-sm">{losers} losers</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cumulative P&L Chart */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Daily Net Cumulative P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyPnL}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(var(--profit))"
                      strokeWidth={2}
                      fill="url(#colorPnl)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Side</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Net P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 5).map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm">
                        {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-muted rounded text-sm font-medium">{trade.symbol}</span>
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{trade.side}</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(trade.pnl - trade.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
