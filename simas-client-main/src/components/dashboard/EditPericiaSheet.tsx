import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WhatsAppPreview } from './WhatsAppPreview';
import { updatePericia, type Pericia } from '@/lib/apiClient';
import { showSuccessToast, showApiError } from '@/lib/toast-helpers';
import { cn, parseLocalDate } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Pencil, MessageCircle } from 'lucide-react';
import { periciaUpdateSchema } from '@/lib/validation-schemas';
import { toast } from 'sonner';

interface EditPericiaSheetProps {
  pericia: Pericia | null;
  clientName?: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPericiaSheet({ pericia, clientName, open, onClose, onSuccess }: EditPericiaSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    periciado: '',
    numero: '',
    data: '',
    horario: '',
    servico: '',
    data_envio: '',
    enviado: false,
  });
  const [sendDate, setSendDate] = useState<Date | undefined>();
  const [periciaDate, setPericiaDate] = useState<Date | undefined>();

  useEffect(() => {
    if (pericia) {
      setFormData({
        periciado: pericia.periciado || '',
        numero: pericia.numero || '',
        data: pericia.data || '',
        horario: pericia.horario || '',
        servico: pericia.servico || '',
        data_envio: pericia.data_envio || '',
        enviado: pericia.enviado || false,
      });
      
      if (pericia.data) {
        setPericiaDate(parseLocalDate(pericia.data));
      }
      if (pericia.data_envio) {
        setSendDate(parseLocalDate(pericia.data_envio));
      } else {
        setSendDate(undefined);
      }
    }
  }, [pericia]);

  const handleSubmit = useCallback(async () => {
    if (!pericia) return;

    // Validate with Zod schema before sending
    const result = periciaUpdateSchema.safeParse({
      periciado: formData.periciado,
      numero: formData.numero,
      data: formData.data,
      horario: formData.horario,
      servico: formData.servico,
      data_envio: formData.data_envio || null,
      enviado: formData.enviado,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await updatePericia(pericia.id_pericia, result.data);

      showSuccessToast('Perícia atualizada', 'Os dados foram salvos com sucesso');
      onSuccess();
    } catch (error: any) {
      showApiError(error, 'Erro ao salvar', 'updatePericia');
    } finally {
      setLoading(false);
    }
  }, [pericia, formData, onSuccess]);

  if (!pericia) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-serif">
            Detalhes da Perícia
          </SheetTitle>
          <SheetDescription>
            Edite as informações ou visualize a prévia da mensagem
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="edit" className="gap-2">
              <Pencil className="h-4 w-4" />
              Editar Dados
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Preview WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-5">
            {/* Periciado */}
            <div className="space-y-2">
              <Label htmlFor="periciado">Nome do Periciado</Label>
              <Input
                id="periciado"
                value={formData.periciado}
                onChange={(e) => setFormData({ ...formData, periciado: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label htmlFor="servico">Tipo de Serviço</Label>
              <Input
                id="servico"
                value={formData.servico}
                onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                placeholder="Ex: Perícia Médica"
                disabled={loading}
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="numero">Telefone (WhatsApp)</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value.replace(/\D/g, '') })}
                placeholder="5584999999999"
                disabled={loading}
              />
            </div>

            {/* Data da Perícia */}
            <div className="space-y-2">
              <Label>Data da Perícia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !periciaDate && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periciaDate ? format(periciaDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periciaDate}
                    onSelect={(date) => {
                      setPericiaDate(date);
                      if (date) {
                        setFormData({ ...formData, data: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario?.substring(0, 5) || ''}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Data de Envio */}
            <div className="space-y-2">
              <Label>Data/Hora de Envio do Lembrete</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !sendDate && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {sendDate ? format(sendDate, "PPP 'às' HH:mm", { locale: ptBR }) : "Selecione data e hora"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sendDate}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = sendDate 
                          ? new Date(date.setHours(sendDate.getHours(), sendDate.getMinutes()))
                          : date;
                        setSendDate(newDate);
                        setFormData({ ...formData, data_envio: format(newDate, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                    locale={ptBR}
                  />
                  <div className="p-3 border-t">
                    <Label htmlFor="send-time" className="text-xs">Horário do envio</Label>
                    <Input
                      id="send-time"
                      type="time"
                      className="mt-1"
                      value={sendDate ? format(sendDate, 'HH:mm') : ''}
                      onChange={(e) => {
                        if (sendDate && e.target.value) {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(sendDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setSendDate(newDate);
                          setFormData({ ...formData, data_envio: format(newDate, 'yyyy-MM-dd') });
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Enviado */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="enviado"
                checked={formData.enviado}
                onCheckedChange={(checked) => setFormData({ ...formData, enviado: !!checked })}
                disabled={loading}
              />
              <Label htmlFor="enviado" className="text-sm font-normal cursor-pointer">
                Marcar como enviada
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <WhatsAppPreview 
              pericia={{
                ...pericia,
                ...formData,
              }}
              companyName={clientName}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
