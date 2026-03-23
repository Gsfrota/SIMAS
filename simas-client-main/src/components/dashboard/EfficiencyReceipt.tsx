import { Card } from "@/components/ui/card";
import { TrendingUp, Clock } from "lucide-react";

interface EfficiencyReceiptProps {
  totalEnviadas: number;
}

export function EfficiencyReceipt({ totalEnviadas }: EfficiencyReceiptProps) {
  // 30 minutes saved per procedure sent
  const minutesSaved = totalEnviadas * 30;
  const hoursSaved = minutesSaved / 60;

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours.toFixed(1).replace(".0", "")} Horas`;
  };

  return (
    <Card className="relative overflow-hidden border-border bg-card">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent" />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-lg bg-accent/10 p-3">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Eficiência do Escritório
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-sans font-semibold text-foreground tracking-tight">
                {formatHours(hoursSaved)}
              </span>
              {hoursSaved >= 1 && <span className="text-lg text-muted-foreground font-medium">economizadas</span>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Calculado com base em {totalEnviadas} procedimentos realizados.
              </p>
            </div>
          </div>

          {/* Metric detail */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-2xl font-sans font-semibold text-foreground">{totalEnviadas}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">procedimentos</span>
            <span className="text-xs text-muted-foreground">concluídos</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
