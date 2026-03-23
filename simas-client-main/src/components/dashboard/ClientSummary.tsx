import { Card } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import type { ClientSummary as ClientSummaryType } from '@/lib/apiClient';

interface ClientSummaryProps {
  clients: ClientSummaryType[];
}

export function ClientSummary({ clients }: ClientSummaryProps) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Resumo por Cliente</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id_cliente} className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold">{client.cliente}</h3>
              <p className="text-sm text-muted-foreground">{client.nome_empresa}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{client.total_pericias}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-success">Enviadas:</span>
                <span className="font-medium text-success">{client.total_enviadas}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-warning">Aguardando:</span>
                <span className="font-medium text-warning">{client.total_pericias - client.total_enviadas - client.total_com_erro}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-destructive">Com erro:</span>
                <span className="font-medium text-destructive">{client.total_com_erro}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
