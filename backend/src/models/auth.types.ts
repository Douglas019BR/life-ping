import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/\d/, 'Senha deve conter pelo menos um dígito')
  .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const RegisterSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  whatsapp: z.string().regex(/^\d{10,15}$/, 'WhatsApp deve conter entre 10 e 15 dígitos'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface RefreshJWTPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}
