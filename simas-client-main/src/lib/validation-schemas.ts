import { z } from 'zod';

/**
 * Validation schemas for all user inputs
 * Defense-in-depth: validates inputs before sending to API
 */

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Email inválido' })
    .max(255, { message: 'Email muito longo' }),
  password: z
    .string()
    .min(1, { message: 'Senha é obrigatória' })
    .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    .max(128, { message: 'Senha muito longa' }),
});

// Registration schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Nome é obrigatório' })
      .min(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
      .max(100, { message: 'Nome muito longo' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email é obrigatório' })
      .email({ message: 'Email inválido' })
      .max(255, { message: 'Email muito longo' }),
    password: z
      .string()
      .min(1, { message: 'Senha é obrigatória' })
      .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
      .max(128, { message: 'Senha muito longa' }),
    confirmPassword: z.string().min(1, { message: 'Confirmação de senha é obrigatória' }),
    code: z
      .string()
      .trim()
      .min(1, { message: 'Código de convite é obrigatório' })
      .max(50, { message: 'Código muito longo' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

// Pericia update schema
export const periciaUpdateSchema = z.object({
  periciado: z
    .string()
    .trim()
    .min(1, { message: 'Nome do periciado é obrigatório' })
    .max(200, { message: 'Nome muito longo' }),
  numero: z
    .string()
    .regex(/^\d*$/, { message: 'Telefone deve conter apenas números' })
    .max(20, { message: 'Telefone muito longo' })
    .optional()
    .or(z.literal('')),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida' })
    .optional()
    .or(z.literal('')),
  horario: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Horário inválido' })
    .optional()
    .or(z.literal('')),
  servico: z
    .string()
    .trim()
    .max(100, { message: 'Serviço muito longo' })
    .optional()
    .or(z.literal('')),
  data_envio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data de envio inválida' })
    .nullable()
    .optional()
    .or(z.literal('')),
  enviado: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PericiaUpdateInput = z.infer<typeof periciaUpdateSchema>;
