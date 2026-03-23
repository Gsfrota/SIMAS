/**
 * API Client - Funções para comunicação com o backend
 * 
 * Todas as funções usam o authApiClient centralizado que gerencia:
 * - Tokens automaticamente
 * - Refresh quando necessário
 * - Retry em caso de 401
 */

import { authApi, authUpload, ApiError } from './authApiClient';

// Re-exportar ApiError para uso em outros lugares
export { ApiError };

// --- Auth & User Types ---
export interface User {
  id: string;
  email: string;
  nome: string;
  id_cliente: number;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  requires_confirmation: boolean;
  message: string;
  user: User;
}

// --- Dashboard Params ---
export interface DashboardParams {
  status?: 'enviada' | 'pendente' | 'erro';
  nome?: string;
  start?: string;
  end?: string;
  page?: number;
  page_size?: number;
}

// --- Pericia Types ---
export type PericiaStatus = 'enviada' | 'pendente' | 'erro';

export interface Pericia {
  id_pericia: number;
  periciado: string;
  numero: string;
  data: string;
  horario: string;
  status: PericiaStatus;
  cpf?: string;
  endereco?: string;
  fileurl?: string;
  enviado: boolean;
  erro?: string | null;
  data_envio?: string | null;
  servico?: string | null;
}

export interface ClientPericias {
  id_cliente: number;
  cliente: string;
  nome_empresa: string;
  pericias: Pericia[];
}

// --- Summary Types ---
export interface GlobalSummary {
  total_pericias: number;
  total_enviadas: number;
  total_com_erro: number;
  total_aguardando: number;
  total_atrasadas: number;
  total_uploads: number;
}

export interface ClientSummary {
  id_cliente: number;
  cliente: string;
  nome_empresa: string;
  total_pericias: number;
  total_enviadas: number;
  total_com_erro: number;
}

// --- Pagination ---
export interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// --- Dashboard Response ---
export interface DashboardResponse {
  summary_global: GlobalSummary;
  summary_by_client: ClientSummary[];
  pericias_by_client: {
    clients: ClientPericias[];
    pagination: PaginationInfo;
  };
}

export interface UpdatePericiaPayload {
  periciado?: string;
  numero?: string;
  data?: string;
  horario?: string;
  data_envio?: string;
  enviado?: boolean;
  servico?: string;
}

// --- Histórico de Perícia ---
export interface HistoricoAlteracao {
  data_alteracao: string;
  campo: string;
  valor_anterior: any;
  valor_novo: any;
  usuario: string;
}

export interface HistoricoResponse {
  historico: HistoricoAlteracao[];
}

/**
 * Busca dados do dashboard
 */
export async function getDashboard(params?: DashboardParams): Promise<DashboardResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.nome) queryParams.append('nome', params.nome);
  if (params?.start) queryParams.append('start', params.start);
  if (params?.end) queryParams.append('end', params.end);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const path = `/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return authApi.get<DashboardResponse>(path);
}

/**
 * Atualiza uma perícia
 */
export async function updatePericia(id: number, payload: UpdatePericiaPayload): Promise<Pericia> {
  return authApi.patch<Pericia>(`/pericias/${id}`, payload);
}

/**
 * Busca histórico de uma perícia
 */
export async function getPericiaHistorico(id: number): Promise<HistoricoResponse> {
  return authApi.get<HistoricoResponse>(`/pericias/${id}/historico`);
}

/**
 * Exclui uma perícia (soft delete)
 */
export async function deletePericia(id: number): Promise<void> {
  return authApi.delete<void>(`/pericias/${id}`, { confirm: 'delete' });
}

// --- Upload Types ---
export interface UploadPericiaResponse {
  id_pericia: number;
  periciado: string;
  data: string;
  horario: string;
  cpf?: string;
  endereco?: string;
  data_envio?: string;
}

/**
 * Faz upload de PDF de perícia
 */
export async function uploadPericiaPDF(
  file: File,
  contato?: string,
  localizacao?: string
): Promise<UploadPericiaResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (contato) formData.append('contato', contato);
  if (localizacao) formData.append('localizacao', localizacao);

  return authUpload<UploadPericiaResponse>('/pericias/upload', formData);
}

// --- Uazapi WhatsApp Integration Types ---
export interface UazapiStatusResponse {
  configured: boolean;
  connected: boolean;
  status: string;
  profile_image_url: string | null;
  details: Record<string, any> | null;
  raw: Record<string, any> | null;
}

export interface UazapiConnectInstance {
  created: boolean;
  token: string;
  url: string;
}

export interface UazapiConnectWebhook {
  configured: boolean;
  raw: Record<string, any>;
}

export interface UazapiConnectResponse {
  instance: UazapiConnectInstance;
  webhook: UazapiConnectWebhook;
  uazapi_response: Record<string, any>;
  provider: Record<string, any>;
}

/**
 * Busca status da conexão WhatsApp
 */
export async function getUazapiStatus(): Promise<UazapiStatusResponse> {
  return authApi.get<UazapiStatusResponse>('/uazapi/status');
}

/**
 * Inicia conexão com WhatsApp
 */
export async function connectUazapi(phone?: string): Promise<UazapiConnectResponse> {
  return authApi.post<UazapiConnectResponse>('/uazapi/connect', { phone: phone || null });
}

// --- Helper Types for Uazapi ---
export interface UazapiInstanceDetails {
  status?: string;
  paircode?: string;
  qrcode?: string;
  lastDisconnectReason?: string;
}

// --- Helper Functions for Safe Extraction ---
export function extractPairCode(response: UazapiConnectResponse): string | null {
  return response.uazapi_response?.instance?.paircode 
    ?? response.provider?.instance?.paircode 
    ?? null;
}

export function extractPairCodeFromStatus(response: UazapiStatusResponse): string | null {
  return (response.details as any)?.instance?.paircode ?? null;
}

export function extractLastDisconnectReason(response: UazapiStatusResponse): string | null {
  return (response.details as any)?.instance?.lastDisconnectReason ?? null;
}
