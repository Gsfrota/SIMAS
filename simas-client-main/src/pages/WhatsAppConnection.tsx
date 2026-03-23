import { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';
import { PairCodeDisplay } from '@/components/whatsapp/PairCodeDisplay';
import { PhoneInput, cleanPhone } from '@/components/whatsapp/PhoneInput';

export default function WhatsAppConnection() {
  const {
    status,
    pairCode,
    isLoading,
    isConnecting,
    isPolling,
    error,
    loadStatus,
    connect,
  } = useWhatsAppConnection();

  const [phone, setPhone] = useState('');

  // Determinar o estado visual da página
  const isConnected = status?.connected === true;
  const isConfigured = status?.configured === true;
  const showPairCodeStep = isConnecting && pairCode;

  const handleConnect = async () => {
    const cleanedPhone = cleanPhone(phone);
    
    if (!cleanedPhone || cleanedPhone.length < 12) {
      alert('Por favor, digite um número válido com DDD');
      return;
    }

    await connect(cleanedPhone);
  };

  // Estado de carregamento inicial
  if (isLoading && !status) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conexão WhatsApp</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie a conexão do seu WhatsApp Business
            </p>
          </div>
          
          {isConnected && (
            <Badge variant="default" className="bg-success text-success-foreground">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Conectado
            </Badge>
          )}
        </div>

        {/* Erro global */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ESTADO 3: CONECTADO */}
        {isConnected && (
          <Card className="border-success/20 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-6 h-6" />
                WhatsApp Conectado
              </CardTitle>
              <CardDescription>
                Sua instância do WhatsApp está ativa e pronta para enviar mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar e informações */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={status?.profile_image_url || undefined} />
                  <AvatarFallback className="bg-success/10 text-success">
                    <Smartphone className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg text-foreground">Perfil WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    Conexão estabelecida com sucesso
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={loadStatus}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ESTADO 2: CONECTANDO (PAIR CODE) */}
        {showPairCodeStep && !isConnected && (
          <Card className="border-primary/20 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Smartphone className="w-6 h-6" />
                Digite o código no WhatsApp
              </CardTitle>
              <CardDescription>
                Siga os passos abaixo para conectar seu WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instruções */}
              <Alert>
                <AlertTitle>Instruções:</AlertTitle>
                <AlertDescription className="space-y-1 sm:space-y-2 mt-2 text-sm">
                  <p>1. Abra o WhatsApp no seu celular</p>
                  <p>2. Vá em <strong>Configurações</strong> → <strong>Aparelhos conectados</strong></p>
                  <p>3. Toque em <strong>Conectar um aparelho</strong></p>
                  <p>4. Digite o código abaixo:</p>
                </AlertDescription>
              </Alert>

              {/* Exibir o código */}
              <div className="flex justify-center py-4 sm:py-6 overflow-x-auto">
                <PairCodeDisplay code={pairCode} />
              </div>

              {/* Indicador de aguardando */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Aguardando conexão...</span>
                {isPolling && <span className="text-xs">(verificando a cada 4s)</span>}
              </div>

            </CardContent>
          </Card>
        )}

        {/* ESTADO 1: NÃO CONFIGURADO / DESCONECTADO */}
        {!isConnected && !showPairCodeStep && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-primary" />
                Conecte seu WhatsApp
              </CardTitle>
              <CardDescription>
                {isConfigured 
                  ? 'Sua instância foi configurada, mas está desconectada. Reconecte agora.'
                  : 'Configure sua instância do WhatsApp para começar a enviar mensagens'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input de telefone */}
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={isLoading}
              />

              {/* Botão de conectar */}
              <Button
                onClick={handleConnect}
                disabled={isLoading || !phone}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>

              {/* Informação adicional */}
              <Alert>
                <AlertDescription className="text-sm">
                  Ao conectar, você receberá um código de 6 dígitos que deverá ser digitado
                  no seu WhatsApp em <strong>Configurações → Aparelhos conectados</strong>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

      </div>
  );
}
