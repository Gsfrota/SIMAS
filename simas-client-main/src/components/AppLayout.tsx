import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Scale } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const auth = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex h-12 sm:h-14 items-center gap-2 sm:gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
            
            <div className="flex items-center gap-2 lg:hidden">
              <div className="rounded-md bg-accent p-1 sm:p-1.5">
                <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
              </div>
              <span className="font-serif font-semibold text-sm sm:text-base">SIMAS</span>
            </div>
            
            <div className="flex-1 min-w-0" />
            
            <div className="text-right shrink-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
                {getGreeting()},
              </p>
              <p className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                {auth.nome || auth.email || 'Usuário'}
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
