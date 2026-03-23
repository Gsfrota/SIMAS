import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriticalAlertsProps {
  overdueCount: number;
  errorCount: number;
  onViewOverdue: () => void;
  onViewErrors: () => void;
}

export function CriticalAlerts({
  overdueCount,
  errorCount,
  onViewOverdue,
  onViewErrors,
}: CriticalAlertsProps) {
  // Não mostra nada se não houver alertas
  if (overdueCount === 0 && errorCount === 0) return null;

  return (
    <div className="space-y-3">
      {/* Alerta de Perícias com Erro - Prioridade Alta */}
      {errorCount > 0 && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/50">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base text-red-900 dark:text-red-100">
                {errorCount} perícia{errorCount > 1 ? 's' : ''} com erro de envio
              </p>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-0.5">
                Revise os dados e tente enviar novamente
              </p>
            </div>
            <Button
              size="sm"
              onClick={onViewErrors}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Ver Com Erro
            </Button>
          </div>
        </div>
      )}

      {/* Alerta de Perícias Atrasadas */}
      {overdueCount > 0 && (
        <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/30 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/50">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base text-orange-900 dark:text-orange-100">
                {overdueCount} perícia{overdueCount > 1 ? 's' : ''} atrasada{overdueCount > 1 ? 's' : ''} {overdueCount === 1 ? 'necessita' : 'necessitam'} de atenção
              </p>
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-0.5">
                Essas perícias já passaram da data agendada
              </p>
            </div>
            <Button
              size="sm"
              onClick={onViewOverdue}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
            >
              Ver Atrasadas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
