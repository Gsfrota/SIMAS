import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

interface VoiceActivationModalProps {
  open: boolean;
  onActivate: () => void;
  onCancel: () => void;
}

export function VoiceActivationModal({ open, onActivate, onCancel }: VoiceActivationModalProps) {
  const { speak, isSupported } = useVoiceAssistant({ rate: 1.0 });

  const handleActivate = () => {
    if (isSupported) {
      speak('Assistente de voz ativado.');
    }
    onActivate();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent p-3">
              <Volume2 className="h-6 w-6 text-accent-foreground" />
            </div>
            <DialogTitle className="text-xl">Ativar Assistente de Voz</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p>
              O assistente de voz ajuda usuários com deficiência visual a navegar pelo sistema,
              narrando automaticamente informações importantes do painel.
            </p>
            <p className="text-muted-foreground text-sm">
              Navegadores bloqueiam áudio automático por padrão. Clique em "Ativar agora" para
              permitir que o assistente fale.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleActivate} className="gap-2">
            <Volume2 className="h-4 w-4" />
            Ativar agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
