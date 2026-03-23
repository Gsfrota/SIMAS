import { Card } from '@/components/ui/card';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseLocalDate } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type FilterType = 'pending' | 'overdue' | 'completed' | null;

interface SummaryCardsProps {
  summary: {
    total_pericias: number;
    total_enviadas: number;
    total_aguardando: number;
    total_com_erro: number;
    total_atrasadas: number;
    total_uploads: number;
  };
  pericias?: Array<{ data: string; enviado: boolean }>;
  activeFilter?: FilterType;
  onFilterClick?: (filter: FilterType) => void;
}

export function SummaryCards({ summary, pericias = [], activeFilter, onFilterClick }: SummaryCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pendentes: data >= today AND enviado == false
  const pendingCount = pericias.filter((p) => {
    const periciaDate = parseLocalDate(p.data);
    periciaDate.setHours(0, 0, 0, 0);
    return periciaDate >= today && !p.enviado;
  }).length;

  // Atrasadas: data < today AND enviado == false
  const overdueCount = pericias.filter((p) => {
    const periciaDate = parseLocalDate(p.data);
    periciaDate.setHours(0, 0, 0, 0);
    return periciaDate < today && !p.enviado;
  }).length;

  // Concluídos: enviado == true
  const completedCount = summary.total_enviadas;

  const cards = [
    {
      id: 'pending' as FilterType,
      title: 'Aguardando Envio',
      value: pendingCount,
      icon: Clock,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      tooltip: 'Procedimentos agendados para hoje ou futuro que ainda não foram enviados. Clique para filtrar.',
    },
    {
      id: 'overdue' as FilterType,
      title: 'Atenção: Atrasados',
      value: overdueCount,
      icon: AlertTriangle,
      iconBg: overdueCount > 0 ? 'bg-destructive/10' : 'bg-muted',
      iconColor: overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground',
      tooltip: 'Procedimentos com data passada que não foram enviados. Requerem atenção imediata! Clique para filtrar.',
      accent: overdueCount > 0 ? 'border-l-4 border-l-destructive' : '',
    },
    {
      id: 'completed' as FilterType,
      title: 'Concluídos',
      value: completedCount,
      icon: CheckCircle,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      tooltip: 'Procedimentos que já foram enviados com sucesso. Clique para filtrar.',
      accent: 'border-l-4 border-l-success',
    },
  ];

  const handleCardClick = (cardId: FilterType) => {
    if (!onFilterClick) return;
    // Toggle: if already active, clear filter
    if (activeFilter === cardId) {
      onFilterClick(null);
    } else {
      onFilterClick(cardId);
    }
  };

  // Aria-labels for accessibility
  const getAriaLabel = (card: typeof cards[0], isActive: boolean) => {
    const filterAction = isActive ? 'Limpar filtro' : 'Filtrar';
    return `${card.title}: ${card.value}. ${filterAction}. ${card.tooltip}`;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        id="tour-stats-cards" 
        className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3"
        role="group"
        aria-label="Resumo de perícias"
      >
        {cards.map((card, index) => {
          const isActive = activeFilter === card.id;
          return (
            <Tooltip key={card.title}>
              <TooltipTrigger asChild>
                <Card 
                  role="button"
                  tabIndex={0}
                  aria-label={getAriaLabel(card, isActive)}
                  aria-pressed={isActive}
                  onClick={() => handleCardClick(card.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(card.id);
                    }
                  }}
                  className={`
                    p-5 sm:p-6 border-border bg-card cursor-pointer 
                    transition-all duration-300 ease-out
                    hover:shadow-lg hover:-translate-y-1
                    active:scale-[0.98]
                    animate-fade-in
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${card.accent || ''} 
                    ${isActive ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {card.title}
                      </p>
                      <p className={`text-3xl sm:text-4xl font-sans font-semibold tracking-tight transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : ''}`}>
                        {card.value}
                      </p>
                      <p className={`text-xs pt-1 transition-colors duration-200 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {isActive ? '✓ Filtro ativo • Clique para limpar' : 'Clique para filtrar'}
                      </p>
                    </div>
                    <div className={`rounded-lg ${card.iconBg} p-3 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                      <card.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.iconColor} transition-all duration-300`} aria-hidden="true" />
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-center">
                <p>{card.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
