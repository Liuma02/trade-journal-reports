import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 glass-effect sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-secondary/80 rounded-xl p-2 transition-all duration-300" />
              {title && (
                <h1 className="text-xl font-semibold tracking-tight gradient-text">{title}</h1>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
