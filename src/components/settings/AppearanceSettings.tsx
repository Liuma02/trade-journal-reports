import { useSettings, Theme } from '@/contexts/SettingsContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" />, description: 'Clean and bright interface' },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" />, description: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: <Monitor className="w-5 h-5" />, description: 'Match your device settings' },
];

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize how the app looks and feels</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => updateSettings({ theme: theme.value })}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300
                ${settings.theme === theme.value 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                  : 'border-border/50 hover:border-border hover:bg-secondary/30'}
              `}
            >
              {settings.theme === theme.value && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                ${settings.theme === theme.value 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary/50 text-muted-foreground'}
              `}>
                {theme.icon}
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">{theme.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Preview</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            P
          </div>
          <div className="flex-1">
            <div className="h-3 w-32 bg-foreground/20 rounded-full mb-2" />
            <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-profit/20 flex items-center justify-center text-profit text-xs font-bold">+</div>
            <div className="w-8 h-8 rounded-lg bg-loss/20 flex items-center justify-center text-loss text-xs font-bold">-</div>
          </div>
        </div>
      </div>
    </div>
  );
}
