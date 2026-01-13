import { AppLayout } from '@/components/layout/AppLayout';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { TradingPreferences } from '@/components/settings/TradingPreferences';
import { DisplayOptions } from '@/components/settings/DisplayOptions';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { Settings as SettingsIcon, Palette, TrendingUp, Monitor, User } from 'lucide-react';

const sections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'trading', label: 'Trading', icon: TrendingUp },
  { id: 'display', label: 'Display', icon: Monitor },
  { id: 'account', label: 'Account', icon: User },
];

export default function Settings() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your preferences and account</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-6 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Settings Content */}
          <div className="flex-1 space-y-8">
            <section id="appearance" className="glass-card p-6">
              <AppearanceSettings />
            </section>

            <section id="trading" className="glass-card p-6">
              <TradingPreferences />
            </section>

            <section id="display" className="glass-card p-6">
              <DisplayOptions />
            </section>

            <section id="account" className="glass-card p-6">
              <AccountSettings />
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
