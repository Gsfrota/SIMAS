import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown } from 'lucide-react';
import type { DashboardParams } from '@/lib/apiClient';

interface DashboardFiltersProps {
  onApplyFilters: (filters: DashboardParams) => void;
}

export function DashboardFilters({ onApplyFilters }: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [nome, setNome] = useState('');

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (startDate) count++;
    if (endDate) count++;
    if (status !== 'all') count++;
    if (nome) count++;
    return count;
  }, [startDate, endDate, status, nome]);

  const handleApply = () => {
    const filters: DashboardParams = {};
    
    if (startDate) filters.start = startDate;
    if (endDate) filters.end = endDate;
    if (status !== 'all') filters.status = status as 'enviada' | 'pendente' | 'erro';
    if (nome) filters.nome = nome;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setNome('');
    onApplyFilters({});
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 px-3 sm:px-5 py-3 sm:py-4 shadow-sm hover:border-primary/30 transition-all cursor-pointer active:scale-[0.99]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-md bg-primary/10">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <span className="font-medium text-sm sm:text-base text-foreground">
                Filtrar perícias
              </span>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden xs:block">
                {isOpen ? 'Clique para ocultar' : 'Clique para buscar e filtrar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs mr-1 sm:mr-2 px-1.5 sm:px-2.5">
                {activeFiltersCount}
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 rounded-lg border bg-card p-4 sm:p-6 shadow-sm animate-fade-in">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="start-date" className="text-xs sm:text-sm">Data inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="end-date" className="text-xs sm:text-sm">Data final</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="enviada">Enviadas</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="erro">Com erro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="nome" className="text-xs sm:text-sm">Nome do periciado</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Buscar..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button onClick={handleApply} size="sm" className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm" className="w-full sm:w-auto">
            Limpar
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
