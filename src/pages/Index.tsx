import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  BookOpen,
  Settings,
  Compass,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

const navItems = [
  { icon: Compass, label: "Dashboard", hint: "Center yourself", href: "/" },
  { icon: TrendingUp, label: "Reports", hint: "Review your decisions", href: "/reports" },
  { icon: Calendar, label: "Calendar", hint: "See your trading days", href: "#" },
  { icon: Target, label: "Goals", hint: "Set quiet intentions", href: "#" },
  { icon: BookOpen, label: "Journal", hint: "Write what you noticed", href: "#" },
  { icon: Settings, label: "Settings", hint: "Adjust your cockpit", href: "#" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Reports",
    copy: "Understand what actually works.",
    href: "/reports",
    available: true,
  },
  {
    icon: Calendar,
    title: "Calendar",
    copy: "See your week the way it really happened.",
    href: "#",
    available: false,
  },
  {
    icon: Target,
    title: "Goals",
    copy: "Quiet targets you can return to.",
    href: "#",
    available: false,
  },
  {
    icon: BookOpen,
    title: "Journal",
    copy: "Capture the thinking behind the trade.",
    href: "#",
    available: false,
  },
];

const Index = () => {
  // Demo numbers — keep tabular alignment for calm scanning
  const netProfit = 5832;
  const winRate = 68;
  const totalTrades = 142;
  const profitFactor = 2.4;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar — minimal vertical icon bar */}
        <aside className="w-16 border-r border-border/50 bg-card/40 flex flex-col items-center py-6 gap-1">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <Compass className="h-4.5 w-4.5 text-primary" />
          </div>
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-200"
                >
                  <item.icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.hint}
              </TooltipContent>
            </Tooltip>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 px-10 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Today
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Your Trading Reality
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
                A quiet place to look at your decisions honestly — without the noise.
              </p>
            </header>

            {/* Stats — emotionally meaningful */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
              <StatCard
                label={netProfit >= 0 ? "You're up this period" : "You're down this period"}
                value={`${netProfit >= 0 ? "+" : "−"}$${Math.abs(netProfit).toLocaleString()}`}
                tone={netProfit >= 0 ? "profit" : "loss"}
              />
              <StatCard
                label="Consistency Score"
                value={`${winRate}%`}
                hint="of trades land in your favor"
              />
              <StatCard
                label="Trades taken"
                value={totalTrades.toString()}
                hint="this period"
              />
              <StatCard
                label="Profit Factor"
                value={profitFactor.toFixed(2)}
                hint="reward earned per unit of risk"
              />
            </section>

            {/* Feature cards */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                See the truth clearly
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "profit" | "loss";
}) {
  const toneClass =
    tone === "profit"
      ? "text-profit"
      : tone === "loss"
      ? "text-loss"
      : "text-foreground";
  return (
    <Card className="rounded-2xl border-border/50 bg-card/60 p-5 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border">
      <p className={`text-2xl font-semibold tabular-nums tracking-tight ${toneClass}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{label}</p>
      {hint && (
        <p className="text-[11px] text-muted-foreground/70 mt-1">{hint}</p>
      )}
    </Card>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  copy,
  href,
  available,
}: {
  icon: typeof TrendingUp;
  title: string;
  copy: string;
  href: string;
  available: boolean;
}) {
  return (
    <Link
      to={href}
      className="group block rounded-2xl border border-border/50 bg-card/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/15 transition-transform duration-200 group-hover:scale-105">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-medium text-foreground tracking-tight">
              {title}
            </h3>
            {!available && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 px-2 py-0.5 rounded-full border border-border/60">
                Soon
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {available ? copy : "Unlock deeper insights soon."}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default Index;
