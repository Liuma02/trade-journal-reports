import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Filter, Calendar as CalendarIcon, User } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showFilters?: boolean;
}

export function AppLayout({ children, title, showFilters = false }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center justify-between px-6 glass-effect sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-secondary rounded-lg" />
              {title && (
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {showFilters && (
                <>
                  <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                    <CalendarIcon className="w-4 h-4" />
                    Date range
                  </Button>
                </>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 bg-secondary/50">
                <User className="w-4 h-4" />
              </Button>
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
