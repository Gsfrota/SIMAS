import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeletePericiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periciaName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeletePericiaDialog({
  open,
  onOpenChange,
  periciaName,
  onConfirm,
  isDeleting,
}: DeletePericiaDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isValid = confirmText.trim().toLowerCase() === 'delete';

  const handleConfirm = () => {
    if (!isValid) {
      setAttemptedSubmit(true);
      return;
    }
    onConfirm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isDeleting) {
      setConfirmText('');
      setAttemptedSubmit(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Excluir perícia</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="text-sm leading-relaxed">
              Tem certeza de que deseja excluir a perícia de <span className="font-semibold text-foreground">{periciaName}</span>?
            </p>
            <p className="text-sm leading-relaxed">
              Esta ação removerá a perícia da sua lista de forma permanente.
            </p>
            <div className="pt-2">
              <Label htmlFor="confirm-text" className="text-sm font-medium text-foreground">
                Para confirmar, digite <span className="font-mono font-bold">delete</span> abaixo:
              </Label>
              <div className="relative mt-2">
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setAttemptedSubmit(false);
                  }}
                  placeholder="Digite 'delete' para confirmar"
                  disabled={isDeleting}
                  className={cn(
                    'pr-10',
                    attemptedSubmit && !isValid && 'border-destructive focus-visible:ring-destructive',
                    isValid && 'border-success focus-visible:ring-success'
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isValid && !isDeleting) {
                      handleConfirm();
                    }
                  }}
                />
                {confirmText && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              {attemptedSubmit && !isValid && (
                <p className="text-xs text-destructive mt-1.5">
                  Digite exatamente "delete" para confirmar a exclusão
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
