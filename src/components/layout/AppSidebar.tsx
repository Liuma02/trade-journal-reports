import { 
  LayoutDashboard, 
  Calendar, 
  LineChart, 
  BookOpen, 
  BarChart3,
  Upload,
  Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Trades", url: "/trades", icon: LineChart },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar 
      className="border-r border-sidebar-border sidebar-glass"
      collapsible="icon"
    >
      <SidebarHeader className="p-5 border-b border-sidebar-border/50">
        <div className="flex items-center gap-4">
          {/* Premium Logo Container */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" />
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-sidebar-accent to-sidebar-background flex items-center justify-center p-2 ring-1 ring-white/10 shadow-2xl">
              <img 
                src={logo} 
                alt="20 Point" 
                className="w-full h-full object-contain drop-shadow-lg" 
              />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-2xl text-sidebar-foreground tracking-tight">20 Point</span>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <span className="text-xs text-sidebar-foreground/50 uppercase tracking-[0.2em] font-medium">Fund Managers</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-6 px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`
                          relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group
                          ${isActive 
                            ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-sidebar-primary shadow-lg shadow-primary/10' 
                            : 'hover:bg-sidebar-accent/40 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                          }
                        `}
                        activeClassName=""
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                        )}
                        <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-primary' : 'group-hover:scale-110 group-hover:text-primary'}`} />
                        {!collapsed && (
                          <span className={`font-medium ${isActive ? 'text-sidebar-foreground' : ''}`}>
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <NavLink to="/import">
          <Button 
            className={`
              w-full relative overflow-hidden group
              bg-gradient-to-r from-primary to-accent 
              hover:from-primary/90 hover:to-accent/90
              text-primary-foreground font-semibold
              border-none shadow-lg shadow-primary/25
              transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
              ${collapsed ? 'px-2' : 'px-4 py-3'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Upload className="w-4 h-4 relative z-10" />
            {!collapsed && <span className="ml-2 relative z-10">Import Trades</span>}
          </Button>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
