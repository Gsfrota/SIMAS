import { toast } from "sonner";

/**
 * Toast helpers com estilos consistentes e bonitos
 */

export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 4000,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast.error(title, {
    description,
    duration: 6000,
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    duration: 5000,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 4000,
  });
};

/**
 * Maps HTTP status codes and error types to user-friendly messages
 * This prevents leaking internal implementation details to users
 */
const getUserFriendlyMessage = (error: any): string => {
  // Handle HTTP status codes
  const status = error?.status || error?.response?.status;
  
  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique os campos informados.';
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'O recurso solicitado não foi encontrado.';
    case 409:
      return 'Conflito de dados. O registro pode já existir.';
    case 422:
      return 'Dados inválidos. Verifique os campos informados.';
    case 429:
      return 'Muitas requisições. Aguarde um momento.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Erro no servidor. Tente novamente mais tarde.';
  }

  // Fallback for unknown errors
  return 'Ocorreu um erro inesperado. Tente novamente.';
};

/**
 * Extracts a safe error message for users
 * Only exposes non-technical, user-friendly messages in production
 */
export const extractErrorMessage = (error: any, fallback = "Ocorreu um erro inesperado"): string => {
  if (!error) return fallback;
  
  // In development, show more details for debugging
  if (import.meta.env.DEV) {
    if (typeof error === "string") return error;
    
    if (error?.detail) {
      if (Array.isArray(error.detail)) {
        return error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
      }
      if (typeof error.detail === "string") {
        return error.detail;
      }
      return JSON.stringify(error.detail);
    }
    
    if (error?.message) return error.message;
    
    return fallback;
  }
  
  // In production, return user-friendly messages only
  return getUserFriendlyMessage(error);
};

/**
 * Logs error details to console only in development mode
 */
const logErrorDetails = (error: any, context?: string) => {
  if (import.meta.env.DEV) {
    console.error(`[API Error]${context ? ` ${context}:` : ''}`, error);
  }
};

/**
 * Mostra toast de erro a partir de um objeto de erro
 * Logs full details in dev, shows safe message to users
 */
export const showApiError = (error: any, title = "Erro", context?: string) => {
  logErrorDetails(error, context);
  const message = extractErrorMessage(error);
  showErrorToast(title, message);
};
