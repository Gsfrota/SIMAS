import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, LogOut, LayoutDashboard, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Top row: Logo + Logout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-accent p-2">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">
                SIMAS
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block uppercase tracking-wider">
                Gestão de Procedimentos Judiciais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block mr-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{getGreeting()},</p>
              <p className="font-medium text-sm">{userName}</p>
            </div>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut} 
              className="h-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "gap-2 font-medium rounded-md",
                location.pathname === '/dashboard' && "bg-accent/10 text-accent"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Procedimentos
            </Button>
          </Link>
          <Link to="/whatsapp">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "gap-2 font-medium rounded-md",
                location.pathname === '/whatsapp' && "bg-accent/10 text-accent"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}