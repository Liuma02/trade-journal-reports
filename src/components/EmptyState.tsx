import { Upload, BarChart3, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

interface EmptyStateProps {
  type: 'dashboard' | 'trades' | 'journal' | 'calendar' | 'reports';
  title?: string;
  description?: string;
}

const icons = {
  dashboard: BarChart3,
  trades: BarChart3,
  journal: BookOpen,
  calendar: Calendar,
  reports: BarChart3,
};

const defaultContent = {
  dashboard: {
    title: "No Trade Data Yet",
    description: "Import your trade history to see your performance analytics, win rates, and P&L charts."
  },
  trades: {
    title: "No Trades Found",
    description: "Your trade log is empty. Import trades from your broker to start tracking your performance."
  },
  journal: {
    title: "Start Your Trading Journal",
    description: "Import trades first, then add notes and reflections to track your trading psychology."
  },
  calendar: {
    title: "No Trading Activity",
    description: "Import your trade history to see your daily and weekly performance on the calendar."
  },
  reports: {
    title: "No Data for Reports",
    description: "Import trades to generate detailed reports on your trading performance."
  },
};

export function EmptyState({ type, title, description }: EmptyStateProps) {
  const Icon = icons[type];
  const content = defaultContent[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title || content.title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description || content.description}
      </p>
      <NavLink to="/import">
        <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Upload className="w-4 h-4" />
          Import Trade History
        </Button>
      </NavLink>
    </div>
  );
}
