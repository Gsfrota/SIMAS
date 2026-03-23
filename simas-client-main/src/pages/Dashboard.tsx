import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getDashboard, type DashboardResponse, type DashboardParams } from '@/lib/apiClient';
import { parseLocalDate } from '@/lib/utils';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { SummaryCards, type FilterType } from '@/components/dashboard/SummaryCards';
import { PericiaTable } from '@/components/dashboard/PericiaTable';
import { UploadPericiaCard } from '@/components/dashboard/UploadPericiaCard';
import { CriticalAlerts } from '@/components/dashboard/CriticalAlerts';
import { ActiveFiltersBanner } from '@/components/dashboard/ActiveFiltersBanner';
import { EfficiencyReceipt } from '@/components/dashboard/EfficiencyReceipt';
import { OnboardingTour } from '@/components/dashboard/OnboardingTour';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [originalData, setOriginalData] = useState<DashboardResponse | null>(null);
  const [tableData, setTableData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardParams>({});
  const [activeFilterType, setActiveFilterType] = useState<'overdue' | 'error' | null>(null);
  const [cardFilter, setCardFilter] = useState<FilterType>(null);
  const periciasSectionRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  const fetchDashboard = useCallback(async (params?: DashboardParams) => {
    try {
      return await getDashboard(params);
    } catch (error: any) {
      // Log full error in development only
      if (import.meta.env.DEV) {
        console.error('[Dashboard] fetchDashboard error:', error);
      }
      
      // Show user-friendly error messages
      const status = error?.status;
      if (status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (status === 403) {
        toast.error('Você não tem permissão para acessar esses dados.');
      } else if (status === 404) {
        toast.error('Dados não encontrados.');
      } else if (status >= 500) {
        toast.error('Erro no servidor. Tente novamente mais tarde.');
      } else {
        toast.error('Erro ao carregar dados do dashboard. Tente novamente.');
      }
      return null;
    }
  }, []);

  // Loads the top-of-page data (cards / efficiency / alerts). Filters should NOT affect this.
  const loadOriginal = useCallback(async () => {
    setLoading(true);
    const response = await fetchDashboard();
    if (response && isMountedRef.current) {
      setOriginalData(response);
      setTableData(response);
    }
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [fetchDashboard]);

  // Loads ONLY the table data (filters apply here).
  const loadTable = useCallback(async (params: DashboardParams) => {
    setLoading(true);
    const response = await fetchDashboard(params);
    if (response && isMountedRef.current) {
      setTableData(response);
    }
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    isMountedRef.current = true;
    loadOriginal();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadOriginal]);

  const handleApplyFilters = useCallback((newFilters: DashboardParams) => {
    // Reset to page 1 when applying new filters
    const filtersWithPage = { ...newFilters, page: 1 };
    setFilters(filtersWithPage);
    setActiveFilterType(null);
    setCardFilter(null);
    loadTable(filtersWithPage);
  }, [loadTable]);

  const handleRefresh = useCallback(async () => {
    await loadOriginal();
    if (Object.keys(filters).length > 0) {
      await loadTable(filters);
    }
  }, [loadOriginal, loadTable, filters]);

  const originalPericias = useMemo(() => {
    if (!originalData) return [];
    return originalData.pericias_by_client.clients.flatMap((c) => c.pericias);
  }, [originalData]);

  const overdueCount = useMemo(() => {
    if (!originalData) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return originalData.pericias_by_client.clients
      .flatMap((c) => c.pericias)
      .filter((p) => {
        const periciaDate = parseLocalDate(p.data);
        periciaDate.setHours(0, 0, 0, 0);
        return periciaDate < today && p.status === 'pendente';
      }).length;
  }, [originalData]);

  const scrollToTable = useCallback(() => {
    setTimeout(() => {
      periciasSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, []);

  const handleViewOverdue = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const newFilters: DashboardParams = {
      status: 'pendente' as const,
      end: yesterday.toISOString().split('T')[0],
    };

    const filtersWithPage = { ...newFilters, page: 1 };
    setFilters(filtersWithPage);
    setActiveFilterType('overdue');
    setCardFilter(null);
    loadTable(filtersWithPage);
    scrollToTable();
  }, [loadTable, scrollToTable]);

  const handleViewErrors = useCallback(() => {
    const newFilters: DashboardParams = { status: 'erro' as const, page: 1 };

    setFilters(newFilters);
    setActiveFilterType('error');
    setCardFilter(null);
    loadTable(newFilters);
    scrollToTable();
  }, [loadTable, scrollToTable]);

  const clearTableFilters = useCallback(() => {
    setActiveFilterType(null);
    setCardFilter(null);
    setFilters({});

    if (originalData) {
      setTableData(originalData);
    } else {
      loadOriginal();
    }
  }, [originalData, loadOriginal]);

  const handleClearSpecialFilter = useCallback(() => {
    clearTableFilters();
  }, [clearTableFilters]);

  const handleCardFilterClick = useCallback((filter: FilterType) => {
    if (filter === null) {
      clearTableFilters();
      return;
    }

    setCardFilter(filter);
    setActiveFilterType(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newFilters: DashboardParams = {};

    if (filter === 'pending') {
      // Pendentes: data >= today AND enviado == false
      newFilters = {
        status: 'pendente' as const,
        start: today.toISOString().split('T')[0],
      };
    } else if (filter === 'overdue') {
      // Atrasados: data < today AND enviado == false
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      newFilters = {
        status: 'pendente' as const,
        end: yesterday.toISOString().split('T')[0],
      };
      setActiveFilterType('overdue');
    } else if (filter === 'completed') {
      // Concluídos
      newFilters = { status: 'enviada' as const };
    }

    const filtersWithPage = { ...newFilters, page: 1 };
    setFilters(filtersWithPage);
    loadTable(filtersWithPage);
    scrollToTable();
  }, [clearTableFilters, loadTable, scrollToTable]);

  // Handle page change - MUST be before conditional returns
  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadTable(newFilters);
    
    // Scroll to table section
    setTimeout(() => {
      periciasSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, [filters, loadTable]);

  if (loading && !originalData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const effectiveTableData = tableData || originalData;

  // Pagination info from API response
  const paginationInfo = effectiveTableData?.pericias_by_client.pagination;

  return (
    <div className="bg-background">
      {/* Onboarding Tour - only starts when original data is loaded */}
      <OnboardingTour isDataLoaded={!!originalData} />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl">
        {originalData && effectiveTableData && (
          <>
            {/* Summary Cards - always based on original (unfiltered) data */}
            <SummaryCards
              summary={originalData.summary_global}
              pericias={originalPericias.map((p) => ({ data: p.data, enviado: p.enviado }))}
              activeFilter={cardFilter}
              onFilterClick={handleCardFilterClick}
            />

            {/* Efficiency Receipt - should NOT change with table filters */}
            <EfficiencyReceipt totalEnviadas={originalData.summary_global.total_enviadas} />

            {/* Critical Alerts - should NOT change with table filters */}
            <CriticalAlerts
              overdueCount={overdueCount}
              errorCount={originalData.summary_global.total_com_erro}
              onViewOverdue={handleViewOverdue}
              onViewErrors={handleViewErrors}
            />

            {/* Upload Section */}
            <div className="pt-2 pb-6 border-b border-border/50">
              <UploadPericiaCard onSuccess={handleRefresh} />
            </div>

            {/* Pericias Table Section (filters apply here) */}
            <div ref={periciasSectionRef} className="space-y-4 scroll-mt-8">
              <DashboardFilters onApplyFilters={handleApplyFilters} />

              <ActiveFiltersBanner filterType={activeFilterType} onClear={handleClearSpecialFilter} />

              <PericiaTable
                clients={effectiveTableData.pericias_by_client.clients}
                onRefresh={handleRefresh}
                isRefreshing={loading}
                pagination={paginationInfo}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
