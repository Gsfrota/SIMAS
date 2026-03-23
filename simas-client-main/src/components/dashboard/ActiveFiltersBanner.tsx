import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ActiveFiltersBannerProps {
  filterType: 'overdue' | 'error' | null;
  onClear: () => void;
}

export function ActiveFiltersBanner({ filterType, onClear }: ActiveFiltersBannerProps) {
  if (!filterType) return null;

  const getFilterInfo = () => {
    switch (filterType) {
      case 'overdue':
        return {
          label: 'Mostrando perícias atrasadas',
          description: 'Perícias pendentes com data no passado',
          variant: 'default' as const,
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
        };
      case 'error':
        return {
          label: 'Mostrando perícias com erro',
          description: 'Perícias que falharam no envio',
          variant: 'destructive' as const,
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      default:
        return null;
    }
  };

  const filterInfo = getFilterInfo();
  if (!filterInfo) return null;

  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${filterInfo.bgColor} ${filterInfo.borderColor}`}>
      <div className="flex items-center gap-3">
        <Badge variant={filterInfo.variant} className="font-semibold">
          Filtro Ativo
        </Badge>
        <div>
          <p className="font-medium text-sm">{filterInfo.label}</p>
          <p className="text-xs text-muted-foreground">{filterInfo.description}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-8 gap-2 hover:bg-background/50"
      >
        <X className="h-4 w-4" />
        Limpar filtro
      </Button>
    </div>
  );
}
