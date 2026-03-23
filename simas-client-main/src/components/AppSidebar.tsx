import { Scale, LayoutDashboard, MessageCircle, Settings, BookOpen, ChevronLeft, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Procedimentos",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Gestão de perícias",
  },
  {
    title: "WhatsApp",
    url: "/whatsapp",
    icon: MessageCircle,
    description: "Conexão e envios",
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    description: "Preferências do sistema",
  },
  {
    title: "Tutorial",
    url: "/tutorial",
    icon: BookOpen,
    description: "Aprenda a usar o SIMAS",
  },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  // No mobile (Sheet), sempre mostrar conteúdo expandido
  const showLabels = isMobile || state === "expanded";

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border min-w-[60px] overflow-x-auto z-30">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 sm:py-3">
          <div className="rounded-md bg-sidebar-primary p-1.5 sm:p-2 shrink-0">
            <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-sidebar-primary-foreground" />
          </div>
          {showLabels && (
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-sans font-semibold tracking-tight text-sidebar-foreground truncate">
                SIMAS
              </h1>
              <p className="text-[9px] sm:text-[10px] text-sidebar-muted uppercase tracking-wider truncate font-sans">
                Gestão Judicial
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 text-sidebar-foreground py-2.5 sm:py-2 font-sans",
                          isActive && "bg-sidebar-accent text-sidebar-primary",
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                        {showLabels && <span className="truncate text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={cn("flex items-center gap-2 p-2 font-sans", !showLabels ? "flex-col" : "justify-between")}>
          <ThemeToggle />
          {showLabels && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover text-xs sm:text-sm font-sans"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
          {!showLabels && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
