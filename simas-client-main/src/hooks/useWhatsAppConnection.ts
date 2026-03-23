import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getUazapiStatus, 
  connectUazapi, 
  UazapiStatusResponse,
  extractPairCode,
  extractPairCodeFromStatus,
  extractLastDisconnectReason
} from '@/lib/apiClient';
import { toast } from 'sonner';

interface UseWhatsAppConnectionReturn {
  status: UazapiStatusResponse | null;
  pairCode: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  isPolling: boolean;
  error: string | null;
  loadStatus: () => Promise<void>;
  connect: (phone: string) => Promise<void>;
  disconnect: () => void;
}

export function useWhatsAppConnection(): UseWhatsAppConnectionReturn {
  const [status, setStatus] = useState<UazapiStatusResponse | null>(null);
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phoneRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Função auxiliar para tratar erros
  const getErrorMessage = useCallback((err: any): string => {
    if (err.status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }
    if (err.status === 403) {
      return 'Você não tem permissão para acessar esta funcionalidade.';
    }
    if (err.detail?.includes('timeout')) {
      return 'O servidor demorou para responder. Tente novamente.';
    }
    return err.detail || err.message || 'Não foi possível conectar. Tente novamente em instantes.';
  }, []);

  // Parar polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPolling(false);
    }
  }, []);

  // Desconectar (parar polling)
  const disconnect = useCallback(() => {
    stopPolling();
    if (isMountedRef.current) {
      setIsConnecting(false);
      setPairCode(null);
    }
    phoneRef.current = null;
  }, [stopPolling]);

  // Carregar status inicial
  const loadStatus = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // O authApiClient gerencia tokens automaticamente
      const statusData = await getUazapiStatus();
      
      if (!isMountedRef.current) return;
      
      setStatus(statusData);

      // Se estiver conectando, extrair o pair code e iniciar polling
      if (statusData.status === 'connecting' && !statusData.connected) {
        const code = extractPairCodeFromStatus(statusData);
        if (code) {
          setPairCode(code);
          setIsConnecting(true);
        }
      } else if (statusData.connected) {
        setIsConnecting(false);
        setPairCode(null);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      // Erros 401 são tratados automaticamente pelo authApiClient
      if (err.status === 401) {
        setError('Sessão expirada');
        return;
      }
      
      setError(getErrorMessage(err));
      toast.error('Erro ao carregar status', {
        description: getErrorMessage(err),
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [getErrorMessage]);

  // Iniciar polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);

    pollingIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        stopPolling();
        return;
      }

      try {
        const newStatus = await getUazapiStatus();
        
        if (!isMountedRef.current) return;
        
        setStatus(newStatus);

        // Verificar se conectou
        const loggedIn = (newStatus.details as any)?.status?.loggedIn || 
                         (newStatus.raw as any)?.status?.loggedIn;

        if (newStatus.connected || loggedIn) {
          stopPolling();
          setIsConnecting(false);
          setPairCode(null);
          toast.success('WhatsApp conectado!', {
            description: 'Sua conexão foi estabelecida com sucesso.',
          });
          // Recarregar para pegar foto de perfil
          await loadStatus();
          return;
        }

        // Código expirou
        const lastReason = extractLastDisconnectReason(newStatus);
        const currentPairCode = extractPairCodeFromStatus(newStatus);
        const isExpired = lastReason?.toLowerCase().includes('timeout') && !currentPairCode;

        if (isExpired && !newStatus.connected) {
          toast.info('Código expirado', {
            description: 'Gerando um novo código...',
          });
          
          stopPolling();
          return;
        }

        // Se tem paircode válido, atualizar na tela
        if (currentPairCode) {
          setPairCode(currentPairCode);
        }
      } catch (err: any) {
        // Erros 401 são tratados automaticamente
        if (err.status === 401) {
          stopPolling();
          return;
        }
        // Não parar o polling por um erro isolado
      }
    }, 4000);
  }, [stopPolling, loadStatus]);

  // Iniciar conexão
  const connect = useCallback(async (phone: string) => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setIsConnecting(true);
    setError(null);
    phoneRef.current = phone;

    try {
      const response = await connectUazapi(phone);
      
      if (!isMountedRef.current) return;
      
      // Verificar se já conectou
      const loggedIn = response.uazapi_response?.loggedIn || response.provider?.loggedIn;
      if (loggedIn) {
        toast.success('WhatsApp conectado!', {
          description: 'Sua conexão foi estabelecida com sucesso.',
        });
        setIsConnecting(false);
        setPairCode(null);
        await loadStatus();
        setIsLoading(false);
        return;
      }

      // Verificar rate limit
      const rateLimitMsg = response.uazapi_response?.response || response.provider?.response;
      if (rateLimitMsg && typeof rateLimitMsg === 'string' && rateLimitMsg.toLowerCase().includes('wait')) {
        toast.info('Aguarde um momento', {
          description: 'Uma conexão está em andamento. Aguarde até 2 minutos.',
        });
        startPolling();
        setIsLoading(false);
        return;
      }

      const code = extractPairCode(response);

      if (code) {
        setPairCode(code);
        toast.success('Código de pareamento gerado', {
          description: 'Digite o código no seu WhatsApp para conectar.',
        });
        startPolling();
      } else {
        // Verificar status
        const currentStatus = await getUazapiStatus();
        if (currentStatus.connected) {
          toast.success('WhatsApp conectado!', {
            description: 'Sua conexão foi estabelecida com sucesso.',
          });
          if (isMountedRef.current) {
            setStatus(currentStatus);
            setIsConnecting(false);
          }
          setIsLoading(false);
          return;
        }
        throw new Error('Não foi possível obter o código de pareamento. Tente novamente em 2 minutos.');
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      // Erros 401 são tratados automaticamente
      if (err.status === 401) {
        setError('Sessão expirada');
        setIsConnecting(false);
        return;
      }
      
      setError(getErrorMessage(err));
      setIsConnecting(false);
      toast.error('Erro ao conectar', {
        description: getErrorMessage(err),
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [loadStatus, startPolling, getErrorMessage]);

  // Carregar status ao montar
  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    pairCode,
    isLoading,
    isConnecting,
    isPolling,
    error,
    loadStatus,
    connect,
    disconnect,
  };
}
