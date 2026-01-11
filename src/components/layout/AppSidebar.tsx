import { 
  LayoutDashboard, 
  Calendar, 
  LineChart, 
  BookOpen, 
  BarChart3,
  Upload,
  TrendingUp
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
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-sidebar-accent/50 flex items-center justify-center p-1">
            <img src={logo} alt="20 Point" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-sidebar-foreground tracking-tight">20 Point</span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Fund Managers</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/50 group"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    >
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <NavLink to="/import">
          <Button 
            className={`w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-none shadow-lg transition-all duration-200 ${collapsed ? 'px-2' : ''}`}
          >
            <Upload className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Import Trades</span>}
          </Button>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
