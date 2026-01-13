import { useSettings, PnLType, ReportFilter } from '@/contexts/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3 } from 'lucide-react';

const pnlTypes: { value: PnLType; label: string; description: string }[] = [
  { value: 'net', label: 'Net P&L', description: 'After commissions & fees' },
  { value: 'gross', label: 'Gross P&L', description: 'Before deductions' },
];

const reportFilters: { value: ReportFilter; label: string }[] = [
  { value: 'time', label: 'Time' },
  { value: 'symbol', label: 'Symbol' },
  { value: 'strategy', label: 'Strategy' },
];

export function TradingPreferences() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Trading Preferences</h3>
        <p className="text-sm text-muted-foreground">Configure your default trading analysis settings</p>
      </div>

      {/* Default P&L Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Default P&L Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {pnlTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateSettings({ pnlType: type.value })}
              className={`
                flex flex-col p-4 rounded-xl border-2 transition-all duration-300 text-left
                ${settings.pnlType === type.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border/50 hover:border-border hover:bg-secondary/30'}
              `}
            >
              <span className="font-medium text-foreground">{type.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Default Report Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Default Report Filter
        </label>
        <Select 
          value={settings.defaultReportFilter} 
          onValueChange={(value: ReportFilter) => updateSettings({ defaultReportFilter: value })}
        >
          <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-primary">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            {reportFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This filter will be selected by default when you open the Reports page
        </p>
      </div>
    </div>
  );
}
