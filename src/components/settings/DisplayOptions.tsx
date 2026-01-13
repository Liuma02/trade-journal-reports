import { useSettings, Currency, DateFormat } from '@/contexts/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DollarSign, Calendar, Receipt, Percent } from 'lucide-react';

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

const dateFormats: { value: DateFormat; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '01/13/2026' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '13/01/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-01-13' },
];

export function DisplayOptions() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Display Options</h3>
        <p className="text-sm text-muted-foreground">Customize how data is displayed throughout the app</p>
      </div>

      {/* Currency Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Currency
        </label>
        <Select 
          value={settings.currency} 
          onValueChange={(value: Currency) => updateSettings({ currency: value })}
        >
          <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-primary">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">{currency.symbol}</span>
                  {currency.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Format Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Date Format
        </label>
        <Select 
          value={settings.dateFormat} 
          onValueChange={(value: DateFormat) => updateSettings({ dateFormat: value })}
        >
          <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/30 border-border/50 focus:border-primary">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            {dateFormats.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                <span className="flex items-center gap-3">
                  <span>{format.label}</span>
                  <span className="text-muted-foreground text-xs">({format.example})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toggle Options */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="commissions" className="font-medium text-foreground cursor-pointer">
                Show Commissions
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Display commission costs on trades</p>
            </div>
          </div>
          <Switch
            id="commissions"
            checked={settings.showCommissions}
            onCheckedChange={(checked) => updateSettings({ showCommissions: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="fees" className="font-medium text-foreground cursor-pointer">
                Show Fees
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Display additional fees on trades</p>
            </div>
          </div>
          <Switch
            id="fees"
            checked={settings.showFees}
            onCheckedChange={(checked) => updateSettings({ showFees: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
