import { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  disabled?: boolean;
}

// Função para formatar telefone brasileiro
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
};

// Para enviar à API: remover formatação
export const cleanPhone = (formatted: string): string => {
  return formatted.replace(/\D/g, '');
};

// Validação de telefone brasileiro (55 + DDD válido + 8-9 dígitos)
export const isValidBrazilPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  // Valida: 55 + DDD (2 dígitos, não pode começar com 0) + número (8-9 dígitos começando com 9 para celular)
  return /^55[1-9][0-9]9?\d{8}$/.test(digits);
};

export function PhoneInput({ value, onChange, onValidChange, disabled = false }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(formatPhone(value));
  const [touched, setTouched] = useState(false);

  const digits = cleanPhone(displayValue);
  const isValid = isValidBrazilPhone(digits);
  const showError = touched && digits.length > 0 && !isValid;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatPhone(rawValue);
    setDisplayValue(formatted);
    const cleaned = cleanPhone(formatted);
    onChange(cleaned);
    onValidChange?.(isValidBrazilPhone(cleaned));
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Número do WhatsApp</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="+55 (11) 99999-9999"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`text-base sm:text-sm ${showError ? 'border-destructive' : ''}`}
      />
      {showError ? (
        <p className="text-xs text-destructive">
          Número inválido. Use o formato: +55 (DDD) 9XXXX-XXXX
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Digite o número com DDD que será usado para conectar o WhatsApp
        </p>
      )}
    </div>
  );
}
