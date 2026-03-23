import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthCallbacks, type StoredAuthState } from '@/lib/authApiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://simas-webpage-485911123531.southamerica-east1.run.app';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  idCliente: number | null;
  nome: string | null;
  email: string | null;
}

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  idCliente: number | null;
  nome: string | null;
  email: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  register: (nome: string, email: string, password: string, codigoConvite: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'simas_auth';

// Intervalo de verificação de expiração (30 segundos)
const TOKEN_CHECK_INTERVAL_MS = 30 * 1000;
// Margem para refresh proativo (5 minutos antes de expirar)
const PROACTIVE_REFRESH_MARGIN_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    userId: null,
    idCliente: null,
    nome: null,
    email: null,
  });
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Função para salvar o estado
  const saveAuthState = useCallback((state: AuthState) => {
    setAuthState(state);
    try {
      if (state.accessToken) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Função de logout
  const signOut = useCallback(() => {
    saveAuthState({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      userId: null,
      idCliente: null,
      nome: null,
      email: null,
    });
    toast.success('Logout realizado com sucesso!');
  }, [saveAuthState]);

  // Refresh da sessão
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const currentState = authState.refreshToken ? authState : (() => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();

    if (!currentState?.refreshToken) {
      return false;
    }

    if (isRefreshingRef.current) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ refresh_token: currentState.refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      const newState: AuthState = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        userId: data.user.id,
        idCliente: data.user.id_cliente,
        nome: data.user.nome,
        email: data.user.email,
      };
      
      saveAuthState(newState);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [authState, saveAuthState]);

  // Configurar callbacks do authApiClient
  useEffect(() => {
    setAuthCallbacks(
      (state: StoredAuthState | null) => {
        if (state) {
          setAuthState({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            expiresAt: state.expiresAt,
            userId: state.userId,
            idCliente: state.idCliente,
            nome: state.nome,
            email: state.email,
          });
        }
      },
      () => {
        saveAuthState({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          userId: null,
          idCliente: null,
          nome: null,
          email: null,
        });
      }
    );
  }, [saveAuthState]);

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        if (parsed && typeof parsed === 'object' && parsed.accessToken) {
          setAuthState(parsed as AuthState);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // Silently fail
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh automático em background
  useEffect(() => {
    if (!authState.accessToken || !authState.expiresAt) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    const checkAndRefresh = async () => {
      if (!authState.expiresAt || !authState.refreshToken) return;
      
      const timeToExpire = authState.expiresAt - Date.now();
      
      // Se falta menos de 5 minutos, renova em background
      if (timeToExpire > 0 && timeToExpire < PROACTIVE_REFRESH_MARGIN_MS) {
        await refreshSession();
      }
    };

    // Verificar imediatamente
    checkAndRefresh();

    // Configurar intervalo
    refreshIntervalRef.current = setInterval(checkAndRefresh, TOKEN_CHECK_INTERVAL_MS);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [authState.accessToken, authState.expiresAt, authState.refreshToken, refreshSession]);

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('Email ou senha inválidos');
        }
        if (response.status === 401) {
          throw new Error('Credenciais incorretas');
        }
        throw new Error(data.detail || 'Erro ao fazer login');
      }

      // Calcular expiresAt
      const expiresAt = Date.now() + (data.expires_in * 1000);

      saveAuthState({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        userId: data.user.id,
        idCliente: data.user.id_cliente,
        nome: data.user.nome,
        email: data.user.email,
      });

      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer login';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const register = async (nome: string, email: string, password: string, codigoConvite: string) => {
    try {
      setLoading(true);

      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          nome,
          email,
          password,
          invite_code: codigoConvite,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        if (registerResponse.status === 422) {
          throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
        }
        if (registerResponse.status === 404) {
          throw new Error('Código de convite inválido ou inativo.');
        }
        throw new Error(registerData.detail || 'Erro ao criar conta.');
      }

      // Login automático
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error('Conta criada, mas houve um erro ao fazer login. Tente entrar manualmente.');
      }

      const expiresAt = Date.now() + (loginData.expires_in * 1000);

      saveAuthState({
        accessToken: loginData.access_token,
        refreshToken: loginData.refresh_token,
        expiresAt,
        userId: loginData.user.id,
        idCliente: loginData.user.id_cliente,
        nome: loginData.user.nome,
        email: loginData.user.email,
      });

      toast.success('Conta criada e login realizado com sucesso!');
    } catch (err: any) {
      const message = err.message || 'Erro ao criar conta.';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        expiresAt: authState.expiresAt,
        userId: authState.userId,
        idCliente: authState.idCliente,
        nome: authState.nome,
        email: authState.email,
        loading,
        signIn,
        signOut,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
