import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

// Componente funcional para usar hooks do React Router
const ErrorFallback = ({ 
  error, 
  showDetails, 
  onToggleDetails, 
  onReset 
}: { 
  error: Error | null; 
  showDetails: boolean; 
  onToggleDetails: () => void;
  onReset: () => void;
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onReset();
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('simas_auth');
    onReset();
    navigate('/login');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">
        {/* Ícone e Título */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Algo deu errado
            </h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Encontramos um problema inesperado. Escolha uma das opções abaixo para continuar.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReload}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Página
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 border border-border bg-card text-foreground font-medium py-3 px-4 rounded-lg hover:bg-muted transition-all duration-200 active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Ir para o Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-muted-foreground font-medium py-3 px-4 rounded-lg hover:bg-muted/50 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Fazer Logout
          </button>
        </div>

        {/* Detalhes do Erro (colapsável) - apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <div className="border-t border-border pt-4">
            <button
              onClick={onToggleDetails}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {showDetails ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
            </button>
            
            {showDetails && error && (
              <div className="mt-3 p-4 bg-muted/50 rounded-lg overflow-auto max-h-48 border border-border">
                <p className="text-xs font-mono text-destructive break-words font-medium">
                  {error.message || 'Erro desconhecido'}
                </p>
                {error.stack && (
                  <pre className="text-xs font-mono text-muted-foreground mt-2 whitespace-pre-wrap break-words opacity-70">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log apenas em desenvolvimento - em produção, evitar expor detalhes internos
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Erro capturado:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      showDetails: false 
    });
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
