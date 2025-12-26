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

export const GoogleAuthSchema = z.object({
  redirectUri: z.string().url('URI de redirecionamento inválida'),
});

export const GoogleCallbackSchema = z.object({
  code: z.string().min(1, 'Código de autorização é obrigatório'),
  state: z.string().min(1, 'State é obrigatório'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type GoogleAuthRequest = z.infer<typeof GoogleAuthSchema>;
export type GoogleCallbackRequest = z.infer<typeof GoogleCallbackSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResponse {
  authUrl: string;
  state: string;
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

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export interface GoogleIdTokenPayload {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: number;
  exp: number;
}
