import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Calendar, User, FileEdit } from 'lucide-react';
import { getPericiaHistorico, type Pericia, type HistoricoAlteracao } from '@/lib/apiClient';
import { toast } from 'sonner';

interface HistoricoModalProps {
  pericia: Pericia;
  open: boolean;
  onClose: () => void;
}

export function HistoricoModal({ pericia, open, onClose }: HistoricoModalProps) {
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<HistoricoAlteracao[]>([]);

  useEffect(() => {
    if (open) {
      loadHistorico();
    }
  }, [open, pericia.id_pericia]);

  const loadHistorico = async () => {
    setLoading(true);
    try {
      // O authApiClient gerencia tokens e retry automaticamente
      const response = await getPericiaHistorico(pericia.id_pericia);
      setHistorico(response.historico);
    } catch (error: any) {
      // Erros 401 são tratados automaticamente pelo authApiClient
      if (error.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    return String(value);
  };

  const getFieldLabel = (campo: string) => {
    const labels: Record<string, string> = {
      periciado: 'Periciado',
      numero: 'Número',
      data: 'Data',
      horario: 'Horário',
      enviado: 'Enviado',
      data_envio: 'Data de Envio',
      endereco: 'Endereço',
      cpf: 'CPF',
    };
    return labels[campo] || campo;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Alterações</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Perícia: {pericia.periciado}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileEdit className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma alteração registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item, index) => (
                <div
                  key={index}
                  className="border-l-2 border-primary pl-4 pb-4 relative"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  
                  <div className="flex flex-wrap items-center gap-3 mb-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateTime(item.data_alteracao)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>{item.usuario}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      Campo: <span className="text-foreground">{getFieldLabel(item.campo)}</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground line-through">
                        {formatValue(item.valor_anterior)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground font-medium">
                        {formatValue(item.valor_novo)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
