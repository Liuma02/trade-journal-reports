import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

export function ThemeToggle() {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'system'] as const;
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  const getIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-4 w-4 text-foreground relative z-10 transition-transform duration-300 group-hover:rotate-45" />;
      case 'system':
        return <Monitor className="h-4 w-4 text-foreground relative z-10 transition-transform duration-300 group-hover:scale-110" />;
      default:
        return <Moon className="h-4 w-4 text-foreground relative z-10 transition-transform duration-300 group-hover:-rotate-12" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {getIcon()}
      <span className="sr-only">Toggle theme ({settings.theme})</span>
    </Button>
  );
}
