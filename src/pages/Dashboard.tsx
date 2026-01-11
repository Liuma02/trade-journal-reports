import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrades } from "@/contexts/TradeContext";
import { EmptyState } from "@/components/EmptyState";
import { TrendingUp, TrendingDown, Target, DollarSign, Zap, Award, AlertTriangle, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const Dashboard = () => {
  const { 
    trades, 
    getTotalPnL, 
    getWinRate, 
    getProfitFactor, 
    getDailyPnL,
    getMaxDrawdown,
    getAverageRR,
    getPerformanceBySymbol,
    getBestWorstTrades,
    getStreaks
  } = useTrades();
  
  if (trades.length === 0) {
    return (
      <AppLayout title="Dashboard" showFilters>
        <EmptyState type="dashboard" />
      </AppLayout>
    );
  }

  const totalPnL = getTotalPnL();
  const winRate = getWinRate();
  const profitFactor = getProfitFactor();
  const dailyPnL = getDailyPnL();
  const maxDrawdown = getMaxDrawdown();
  const averageRR = getAverageRR();
  const performanceBySymbol = getPerformanceBySymbol();
  const { best, worst } = getBestWorstTrades();
  const streaks = getStreaks();

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
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Net P&L</p>
                  <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(totalPnL)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trades.length} trades total
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${totalPnL >= 0 ? 'bg-profit/15' : 'bg-loss/15'}`}>
                  <DollarSign className={`w-6 h-6 ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Factor</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Risk/Reward: {averageRR.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/15">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Max Drawdown</p>
                  <p className="text-2xl font-bold text-loss">
                    -${maxDrawdown.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Longest loss streak: {streaks.longestLossStreak}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-loss/15">
                  <AlertTriangle className="w-6 h-6 text-loss" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className={`text-2xl font-bold ${streaks.currentStreak >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {streaks.currentStreak >= 0 ? '+' : ''}{streaks.currentStreak}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best streak: {streaks.longestWinStreak} wins
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${streaks.currentStreak >= 0 ? 'bg-profit/15' : 'bg-loss/15'}`}>
                  <Zap className={`w-6 h-6 ${streaks.currentStreak >= 0 ? 'text-profit' : 'text-loss'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Winner</p>
                  <p className="text-2xl font-bold text-profit">
                    {formatCurrency(avgWinner)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-profit/15">
                  <TrendingUp className="w-6 h-6 text-profit" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Loser</p>
                  <p className="text-2xl font-bold text-loss">
                    -${avgLoser.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-loss/15">
                  <TrendingDown className="w-6 h-6 text-loss" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Trade</p>
                  <p className="text-2xl font-bold text-profit">
                    {best ? formatCurrency(best.pnl) : '$0'}
                  </p>
                  {best && <p className="text-xs text-muted-foreground mt-1">{best.symbol}</p>}
                </div>
                <div className="p-3 rounded-xl bg-profit/15">
                  <Award className="w-6 h-6 text-profit" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Worst Trade</p>
                  <p className="text-2xl font-bold text-loss">
                    {worst ? formatCurrency(worst.pnl) : '$0'}
                  </p>
                  {worst && <p className="text-xs text-muted-foreground mt-1">{worst.symbol}</p>}
                </div>
                <div className="p-3 rounded-xl bg-loss/15">
                  <TrendingDown className="w-6 h-6 text-loss" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Win Rate Pie Charts */}
          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Win Rate Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winRateData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
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
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</span>
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
          <Card className="chart-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyPnL}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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

        {/* Performance by Symbol */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                P&L by Symbol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceBySymbol.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="symbol"
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'P&L']}
                    />
                    <Bar 
                      dataKey="pnl" 
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--primary))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Symbol</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 6).map((trade) => (
                      <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-2 text-sm">
                          {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-1 bg-muted rounded-md text-sm font-medium">{trade.symbol}</span>
                        </td>
                        <td className={`py-2.5 px-2 text-sm text-right font-semibold ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;
