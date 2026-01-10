import { Link } from "react-router-dom";
import { BarChart3, TrendingUp, Calendar, Target, BookOpen, Settings } from "lucide-react";

const navItems = [
  { icon: BarChart3, label: "Dashboard", href: "/" },
  { icon: TrendingUp, label: "Reports", href: "/reports" },
  { icon: Calendar, label: "Calendar", href: "#" },
  { icon: Target, label: "Goals", href: "#" },
  { icon: BookOpen, label: "Journal", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-16 bg-sidebar flex flex-col items-center py-6 gap-4">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center mb-4">
          <TrendingUp className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </Link>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trade Journal</h1>
          <p className="text-muted-foreground mb-8">
            Track, analyze, and improve your trading performance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/reports" 
              className="chart-card hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Reports</h2>
                  <p className="text-sm text-muted-foreground">
                    Analyze your trading patterns and performance
                  </p>
                </div>
              </div>
            </Link>

            <div className="chart-card opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
                  <p className="text-sm text-muted-foreground">
                    View trades by date (Coming soon)
                  </p>
                </div>
              </div>
            </div>

            <div className="chart-card opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Goals</h2>
                  <p className="text-sm text-muted-foreground">
                    Set and track trading goals (Coming soon)
                  </p>
                </div>
              </div>
            </div>

            <div className="chart-card opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Journal</h2>
                  <p className="text-sm text-muted-foreground">
                    Log your trading notes (Coming soon)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="chart-card text-center">
              <p className="text-2xl font-bold text-profit">$5,832</p>
              <p className="text-xs text-muted-foreground">Net Profit</p>
            </div>
            <div className="chart-card text-center">
              <p className="text-2xl font-bold text-foreground">68%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div className="chart-card text-center">
              <p className="text-2xl font-bold text-foreground">142</p>
              <p className="text-xs text-muted-foreground">Total Trades</p>
            </div>
            <div className="chart-card text-center">
              <p className="text-2xl font-bold text-foreground">2.4</p>
              <p className="text-xs text-muted-foreground">Profit Factor</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
