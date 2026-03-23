import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Pencil, RefreshCw, FileText, History, MapPin, Calendar, Clock, 
  AlertCircle, Trash2, CheckCheck, AlertTriangle, Scale, MessageCircle 
} from 'lucide-react';
import { EditPericiaSheet } from './EditPericiaSheet';
import { DeletePericiaDialog } from './DeletePericiaDialog';
import { HistoricoModal } from './HistoricoModal';
import { getDaysUntil, getDateContextColor, truncateAddress, parseLocalDate } from '@/lib/utils';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/toast-helpers';

import type { ClientPericias, Pericia, PericiaStatus, PaginationInfo } from '@/lib/apiClient';
import { deletePericia } from '@/lib/apiClient';

interface PericiaTableProps {
  clients: ClientPericias[];
  onRefresh: () => void;
  isRefreshing: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
}

export function PericiaTable({ clients, onRefresh, isRefreshing, pagination, onPageChange }: PericiaTableProps) {
  const [editingPericia, setEditingPericia] = useState<Pericia | null>(null);
  const [periciaToDelete, setPericiaToDelete] = useState<Pericia | null>(null);
  const [historicoPericia, setHistoricoPericia] = useState<Pericia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (pericia: Pericia) => {
    setPericiaToDelete(pericia);
  };

  const handleConfirmDelete = async () => {
    if (!periciaToDelete) return;

    setIsDeleting(true);
    try {
      await deletePericia(periciaToDelete.id_pericia);
      showSuccessToast('Perícia excluída', 'A perícia foi removida da lista com sucesso');
      setPericiaToDelete(null);
      onRefresh();
    } catch (error: any) {
      // Log full error in development only
      if (import.meta.env.DEV) {
        console.error('[PericiaTable] deletePericia error:', error);
      }
      
      // Show user-friendly error messages based on status
      const status = error?.status;
      if (status === 400) {
        showWarningToast('Confirmação inválida', "Digite exatamente 'delete' para confirmar");
      } else if (status === 401) {
        showErrorToast('Sessão expirada', 'Faça login novamente.');
      } else if (status === 403) {
        showErrorToast('Sem permissão', 'Você não tem permissão para excluir esta perícia.');
      } else if (status === 404) {
        showErrorToast('Não encontrada', 'A perícia já foi excluída ou não existe.');
      } else {
        showErrorToast('Erro ao excluir', 'Não foi possível excluir a perícia. Tente novamente.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Service type badge with color coding
  const getServiceBadge = (servico?: string) => {
    if (!servico) return null;
    
    const serviceLower = servico.toLowerCase();
    
    if (serviceLower.includes('médic') || serviceLower.includes('medic')) {
      return (
        <Badge className="bg-accent/10 text-accent border-0 font-normal whitespace-nowrap">
          {servico}
        </Badge>
      );
    }
    if (serviceLower.includes('social')) {
      return (
        <Badge className="bg-primary/10 text-primary border-0 font-normal whitespace-nowrap">
          {servico}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="font-normal text-muted-foreground">
        {servico}
      </Badge>
    );
  };

  // Status badge with visual icons
  const getStatusBadge = (status: PericiaStatus, data?: string) => {
    // Check if overdue (pending + past date)
    if (status === 'pendente' && data) {
      const periciaDate = parseLocalDate(data);
      periciaDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (periciaDate < today) {
        return (
          <Badge className="bg-warning/10 text-warning border-0 gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Atrasada
          </Badge>
        );
      }
    }
    
    if (status === 'enviada') {
      return (
        <Badge className="bg-success/10 text-success border-0 gap-1">
          <CheckCheck className="h-3.5 w-3.5" />
          Enviada
        </Badge>
      );
    }
    
    if (status === 'erro') {
      return (
        <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Com erro
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-muted text-muted-foreground border-0 gap-1">
        <Clock className="h-3.5 w-3.5" />
        Pendente
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return parseLocalDate(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: string) => {
    if (!date) return '-';
    return parseLocalDate(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const allPericias = clients
    .flatMap((client) =>
      client.pericias.map((pericia) => ({
        ...pericia,
        cliente: client.cliente,
        nome_empresa: client.nome_empresa,
      }))
    )
    .sort((a, b) => {
      const dateA = parseLocalDate(a.data).getTime();
      const dateB = parseLocalDate(b.data).getTime();
      const now = new Date().getTime();

      const aPast = dateA < now;
      const bPast = dateB < now;

      if (aPast && !bPast) return 1;
      if (!aPast && bPast) return -1;
      return dateA - dateB;
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingThisWeek = allPericias.filter((p) => {
    const periciaDate = parseLocalDate(p.data);
    periciaDate.setHours(0, 0, 0, 0);
    return periciaDate >= today && periciaDate <= nextWeek;
  }).length;

  const overdue = allPericias.filter((p) => {
    const periciaDate = parseLocalDate(p.data);
    periciaDate.setHours(0, 0, 0, 0);
    return periciaDate < today && !p.enviado;
  }).length;

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-sans font-semibold">
              Próximos Procedimentos
            </h2>
            <span className="text-muted-foreground text-sm font-sans">
              ({allPericias.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm ml-7">
            {upcomingThisWeek > 0 && (
              <span className="text-success flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {upcomingThisWeek} próxima{upcomingThisWeek > 1 ? 's' : ''}
              </span>
            )}
            {overdue > 0 && (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {overdue} atrasada{overdue > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Desktop/Tablet Table View */}
      <Card id="tour-data-table" className="hidden md:block border-border bg-card overflow-hidden">
        {/* Scrollable container with fixed height for large lists */}
        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto scrollbar-thin">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="font-medium bg-card">Periciado</TableHead>
                <TableHead className="font-medium bg-card">Serviço</TableHead>
                <TableHead className="font-medium bg-card">Data / Hora</TableHead>
                <TableHead className="font-medium bg-card">Local</TableHead>
                <TableHead className="font-medium bg-card">Status</TableHead>
                <TableHead className="font-medium bg-card">Envio</TableHead>
                <TableHead className="text-right font-medium bg-card">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPericias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="h-12 w-12 opacity-20" />
                      <p className="font-medium">Nenhuma perícia encontrada</p>
                      <p className="text-sm">Ajuste os filtros ou aguarde novas perícias</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                allPericias.map((pericia, index) => {
                  const { days, isPast, label } = getDaysUntil(pericia.data);
                  const dateColor = getDateContextColor(days, isPast);

                  return (
                    <TableRow 
                      key={pericia.id_pericia} 
                      className={`hover:bg-secondary/30 cursor-pointer border-border/30 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                      onClick={() => setEditingPericia(pericia)}
                    >
                      {/* Periciado */}
                      <TableCell className="font-medium">
                        {pericia.periciado}
                      </TableCell>

                      {/* Serviço */}
                      <TableCell>
                        {getServiceBadge(pericia.servico)}
                      </TableCell>

                      {/* Data + Hora */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-sm">
                            <span>{formatDate(pericia.data)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{formatTime(pericia.horario)}</span>
                          </div>
                          <span className={`text-xs font-medium ${dateColor}`}>
                            {label}
                          </span>
                        </div>
                      </TableCell>

                      {/* Local */}
                      <TableCell>
                        {pericia.endereco ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm flex items-center gap-1 cursor-help text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                  {truncateAddress(pericia.endereco, 25)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{pericia.endereco}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {getStatusBadge(pericia.status, pericia.data)}
                      </TableCell>

                      {/* Data Envio */}
                      <TableCell className="text-sm text-muted-foreground">
                        {pericia.data_envio ? formatDateTime(pericia.data_envio) : '-'}
                      </TableCell>

                      {/* Ações */}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1" role="group" aria-label={`Ações para perícia de ${pericia.periciado}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPericia(pericia);
                            }}
                            aria-label={`Editar perícia de ${pericia.periciado} em ${formatDate(pericia.data)} às ${formatTime(pericia.horario)}`}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoricoPericia(pericia);
                            }}
                            aria-label={`Ver histórico de alterações da perícia de ${pericia.periciado}`}
                            className="h-8 w-8 p-0"
                          >
                            <History className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(pericia);
                            }}
                            aria-label={`Excluir perícia de ${pericia.periciado}`}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Inline scroll indicator */}
        {allPericias.length > 10 && (
          <div className="px-4 py-2 border-t border-border/30 bg-muted/30 text-xs text-muted-foreground text-center">
            Role para ver mais perícias • {allPericias.length} itens nesta página
          </div>
        )}
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {allPericias.length === 0 ? (
          <Card className="p-8 border-border/50">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <FileText className="h-12 w-12 opacity-20" />
              <p className="font-medium">Nenhuma perícia encontrada</p>
              <p className="text-sm text-center">Ajuste os filtros ou aguarde novas perícias</p>
            </div>
          </Card>
        ) : (
          allPericias.map((pericia) => {
            const { days, isPast, label } = getDaysUntil(pericia.data);
            const dateColor = getDateContextColor(days, isPast);

            return (
              <Card 
                key={pericia.id_pericia} 
                className="p-4 border-border/50 card-premium cursor-pointer"
                onClick={() => setEditingPericia(pericia)}
              >
                <div className="space-y-3">
                  {/* Header: Nome + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold leading-tight">{pericia.periciado}</h3>
                      <div className="mt-1">
                        {getServiceBadge(pericia.servico)}
                      </div>
                    </div>
                    {getStatusBadge(pericia.status, pericia.data)}
                  </div>

                  {/* Data, Horário e Dias */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(pericia.data)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(pericia.horario)}</span>
                    </div>
                    <span className={`text-sm font-medium ${dateColor}`}>
                      {label}
                    </span>
                  </div>

                  {/* Endereço */}
                  {pericia.endereco && (
                    <div className="flex items-start gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground line-clamp-2">{pericia.endereco}</span>
                    </div>
                  )}

                  {/* Data de Envio Agendada */}
                  {pericia.data_envio && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Envio: {formatDateTime(pericia.data_envio)}</span>
                    </div>
                  )}

                  {/* WhatsApp + Ações */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    {pericia.numero ? (
                      <a
                        href={`https://wa.me/55${pericia.numero.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-success hover:text-success/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{pericia.numero}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem contato</span>
                    )}
                    
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPericia(pericia);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoricoPericia(pericia);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(pericia);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Sheet (replaces Modal) */}
      <EditPericiaSheet
        pericia={editingPericia}
        clientName={(editingPericia as any)?.nome_empresa}
        open={!!editingPericia}
        onClose={() => setEditingPericia(null)}
        onSuccess={() => {
          setEditingPericia(null);
          onRefresh();
        }}
      />

      <DeletePericiaDialog
        open={!!periciaToDelete}
        onOpenChange={(open) => !open && !isDeleting && setPericiaToDelete(null)}
        periciaName={periciaToDelete?.periciado || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {historicoPericia && (
        <HistoricoModal
          pericia={historicoPericia}
          open={!!historicoPericia}
          onClose={() => setHistoricoPericia(null)}
        />
      )}

      {/* Pagination Controls */}
      {pagination && (
        <Card className="mt-4 p-4 border-border/50 bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Total info */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                Mostrando{' '}
                <span className="font-medium text-foreground">
                  {((pagination.page - 1) * pagination.page_size) + 1}-{Math.min(pagination.page * pagination.page_size, pagination.total)}
                </span>
                {' '}de{' '}
                <span className="font-medium text-foreground">{pagination.total}</span>
                {' '}perícias
              </span>
              {pagination.total_pages > 1 && (
                <Badge variant="outline" className="font-normal">
                  Página {pagination.page} de {pagination.total_pages}
                </Badge>
              )}
            </div>
            
            {/* Navigation controls */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center gap-2">
                {/* First page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || isRefreshing}
                  onClick={() => onPageChange?.(1)}
                  aria-label="Primeira página"
                  className="hidden sm:flex"
                >
                  Primeira
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || isRefreshing}
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  aria-label="Página anterior"
                >
                  Anterior
                </Button>
                
                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "ghost"}
                        size="sm"
                        className="w-9 h-9 p-0"
                        disabled={isRefreshing}
                        onClick={() => onPageChange?.(pageNum)}
                        aria-label={`Ir para página ${pageNum}`}
                        aria-current={pageNum === pagination.page ? "page" : undefined}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.total_pages || isRefreshing}
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  aria-label="Próxima página"
                >
                  Próxima
                </Button>
                
                {/* Last page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.total_pages || isRefreshing}
                  onClick={() => onPageChange?.(pagination.total_pages)}
                  aria-label="Última página"
                  className="hidden sm:flex"
                >
                  Última
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
