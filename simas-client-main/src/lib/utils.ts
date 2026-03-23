import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parseia uma string de data no formato YYYY-MM-DD como data local
 * (evita o bug de timezone onde new Date("2025-07-29") interpreta como UTC)
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month é 0-indexed no JS
}

/**
 * Calcula quantos dias faltam/passaram até uma data
 */
export function getDaysUntil(dateString: string): { days: number; isPast: boolean; label: string } {
  if (!dateString) return { days: 0, isPast: false, label: '-' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = parseLocalDate(dateString);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isPast = diffDays < 0;
  
  let label = '';
  if (diffDays === 0) label = 'Hoje';
  else if (diffDays === 1) label = 'Amanhã';
  else if (diffDays === -1) label = 'Ontem';
  else if (diffDays > 1) label = `Em ${diffDays} dias`;
  else label = `Há ${Math.abs(diffDays)} dias`;
  
  return { days: diffDays, isPast, label };
}

/**
 * Retorna a cor contextual baseado em quantos dias faltam
 */
export function getDateContextColor(days: number, isPast: boolean): string {
  if (isPast) return 'text-muted-foreground';
  if (days === 0 || days === 1) return 'text-destructive';
  if (days <= 6) return 'text-amber-600';
  return 'text-emerald-600';
}

/**
 * Trunca um endereço para exibição
 */
export function truncateAddress(address: string, maxLength: number = 30): string {
  if (!address) return '-';
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
}
