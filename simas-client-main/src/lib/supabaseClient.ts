/**
 * ATENÇÃO: Este arquivo não é mais usado diretamente no frontend.
 * 
 * A autenticação e acesso ao banco de dados agora são feitos exclusivamente
 * através da API FastAPI em VITE_API_BASE_URL.
 * 
 * O Supabase é usado apenas no backend (FastAPI) como banco de dados e
 * sistema de autenticação, mas o frontend não interage com ele diretamente.
 * 
 * Todos os endpoints de autenticação e dados estão em src/lib/apiClient.ts
 * e o estado de autenticação é gerenciado em src/contexts/AuthContext.tsx
 */

// Este arquivo é mantido apenas para não quebrar imports legados
// mas não deve ser usado em novos códigos
export const supabase = null as any;
export const isSupabaseConfigured = false;
