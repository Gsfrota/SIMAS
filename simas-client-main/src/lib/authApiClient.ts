/**
 * Cliente HTTP Centralizado com Refresh Automático de Token
 * 
 * Este módulo gerencia automaticamente:
 * - Verificação de expiração de tokens antes de cada request
 * - Refresh automático quando token está próximo de expirar
 * - Retry automático em caso de 401 (uma única tentativa)
 * - Logout automático quando refresh falha
 * 
 * SEGURANÇA: Nunca loga tokens em nenhum cenário
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://simas-webpage-485911123531.southamerica-east1.run.app';
const AUTH_STORAGE_KEY = 'simas_auth';

// Margem de segurança para renovar token (60 segundos antes de expirar)
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

export interface StoredAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  idCliente: number | null;
  nome: string | null;
  email: string | null;
}

export class ApiError extends Error {
  status: number;
  detail: string;
  isNetworkError: boolean;

  constructor(message: string, status: number = 0, detail: string = '', isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.isNetworkError = isNetworkError;
  }
}

// Flag para evitar múltiplos refreshes simultâneos
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Callback para notificar o AuthContext sobre mudanças
let onAuthStateChange: ((state: StoredAuthState | null) => void) | null = null;
let onLogout: (() => void) | null = null;

export function setAuthCallbacks(
  stateChangeCallback: (state: StoredAuthState | null) => void,
  logoutCallback: () => void
) {
  onAuthStateChange = stateChangeCallback;
  onLogout = logoutCallback;
}

/**
 * Lê o estado de autenticação do localStorage
 */
function getStoredAuth(): StoredAuthState | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredAuthState;
  } catch {
    return null;
  }
}

/**
 * Salva o estado de autenticação no localStorage
 */
function saveStoredAuth(state: StoredAuthState): void {
  try {
    if (state.accessToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    onAuthStateChange?.(state);
  } catch (err) {
    // Silently fail - não expor erro
  }
}

/**
 * Limpa o estado de autenticação
 */
function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    onAuthStateChange?.(null);
  } catch {
    // Silently fail
  }
}

/**
 * Verifica se o token deve ser renovado (está a 60s de expirar ou já expirou)
 */
function shouldRefreshToken(expiresAt: number | null): boolean {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - TOKEN_REFRESH_MARGIN_MS;
}

/**
 * Renova o token de acesso usando o refresh token
 * Retorna o novo access token ou null se falhar
 */
async function refreshAccessToken(): Promise<string | null> {
  // Se já está renovando, aguarda o resultado
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const auth = getStoredAuth();
  if (!auth?.refreshToken) {
    return null;
  }

  isRefreshing = true;
  
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ refresh_token: auth.refreshToken }),
      });

      if (!response.ok) {
        // Refresh falhou - limpar auth e fazer logout
        clearStoredAuth();
        onLogout?.();
        return null;
      }

      const data = await response.json();
      
      // Atualizar tokens no storage
      const newState: StoredAuthState = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        userId: data.user.id,
        idCliente: data.user.id_cliente,
        nome: data.user.nome,
        email: data.user.email,
      };
      
      saveStoredAuth(newState);
      return data.access_token;
    } catch {
      // Erro de rede no refresh - limpar auth
      clearStoredAuth();
      onLogout?.();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Obtém um token válido, renovando se necessário
 */
export async function getValidToken(): Promise<string | null> {
  const auth = getStoredAuth();
  
  if (!auth?.accessToken) {
    return null;
  }

  // Se token está próximo de expirar, renova proativamente
  if (shouldRefreshToken(auth.expiresAt)) {
    const newToken = await refreshAccessToken();
    return newToken;
  }

  return auth.accessToken;
}

/**
 * Cliente HTTP centralizado com refresh automático
 */
export async function authFetch<T = any>(
  path: string,
  options: RequestInit = {},
  skipAuth: boolean = false
): Promise<T> {
  // Obter token válido (renova se necessário)
  let token: string | null = null;
  
  if (!skipAuth) {
    token = await getValidToken();
    if (!token) {
      onLogout?.();
      throw new ApiError('Não autenticado', 401, 'not_authenticated', false);
    }
  }

  const makeRequest = async (accessToken: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    };

    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  };

  let response: Response;

  try {
    response = await makeRequest(token);
  } catch {
    throw new ApiError(
      'Falha na conexão com o servidor. Verifique sua internet.',
      0,
      'network_error',
      true
    );
  }

  // Se 401, tentar refresh UMA vez e repetir a request
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      try {
        response = await makeRequest(newToken);
      } catch {
        throw new ApiError(
          'Falha na conexão com o servidor.',
          0,
          'network_error',
          true
        );
      }
    }

    // Se ainda 401 após refresh, fazer logout
    if (response.status === 401) {
      clearStoredAuth();
      onLogout?.();
      throw new ApiError('Sessão expirada', 401, 'session_expired', false);
    }
  }

  // Parse da resposta
  let data: any = null;
  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch {
    if (response.ok) {
      return null as T;
    }
    throw new ApiError(
      'Erro ao processar resposta do servidor',
      response.status,
      'parse_error',
      false
    );
  }

  if (!response.ok) {
    const detail = data?.detail || 'Erro inesperado na API';
    throw new ApiError(detail, response.status, detail, false);
  }

  return data;
}

/**
 * Helpers para métodos HTTP comuns
 */
export const authApi = {
  get: <T = any>(path: string, skipAuth = false) => 
    authFetch<T>(path, { method: 'GET' }, skipAuth),
    
  post: <T = any>(path: string, body?: any, skipAuth = false) => 
    authFetch<T>(path, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    }, skipAuth),
    
  patch: <T = any>(path: string, body?: any) => 
    authFetch<T>(path, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  delete: <T = any>(path: string, body?: any) => 
    authFetch<T>(path, { 
      method: 'DELETE', 
      body: body ? JSON.stringify(body) : undefined 
    }),
};

/**
 * Upload de arquivo com autenticação
 */
export async function authUpload<T = any>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = await getValidToken();
  
  if (!token) {
    onLogout?.();
    throw new ApiError('Não autenticado', 401, 'not_authenticated', false);
  }

  const makeRequest = async (accessToken: string): Promise<Response> => {
    return fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        Authorization: `Bearer ${accessToken}`,
        // Não definir Content-Type - browser define automaticamente para multipart
      },
      body: formData,
    });
  };

  let response: Response;

  try {
    response = await makeRequest(token);
  } catch {
    throw new ApiError(
      'Falha na conexão com o servidor.',
      0,
      'network_error',
      true
    );
  }

  // Se 401, tentar refresh e retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      try {
        response = await makeRequest(newToken);
      } catch {
        throw new ApiError('Falha na conexão.', 0, 'network_error', true);
      }
    }

    if (response.status === 401) {
      clearStoredAuth();
      onLogout?.();
      throw new ApiError('Sessão expirada', 401, 'session_expired', false);
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.detail || 'Erro no upload',
      response.status,
      data?.detail || 'upload_error',
      false
    );
  }

  return data;
}
