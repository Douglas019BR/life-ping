import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  RefreshResponse,
  RefreshJWTPayload,
} from '../models/auth.types';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        lastLogin: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email já está em uso', 409);
    }

    const existingWhatsApp = await this.prisma.user.findUnique({
      where: { whatsapp: data.whatsapp },
    });

    if (existingWhatsApp) {
      throw new AppError('WhatsApp já está em uso', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        whatsapp: data.whatsapp,
        lastLogin: new Date(),
      },
    });

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refresh(data: RefreshTokenRequest): Promise<RefreshResponse> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new AppError('Configuração de JWT inválida', 500);
    }

    try {
      const decoded = jwt.verify(data.refreshToken, refreshSecret) as RefreshJWTPayload;

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.refreshToken) {
        throw new AppError('Token inválido', 401);
      }

      const isTokenValid = await bcrypt.compare(data.refreshToken, user.refreshToken);
      if (!isTokenValid) {
        throw new AppError('Token inválido', 401);
      }

      const accessToken = this.generateAccessToken(user.id, user.email);

      return { accessToken };
    } catch (error) {
      throw new AppError('Token inválido', 401);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as RefreshJWTPayload;

      await this.prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null },
      });
    } catch (error) {
      // Token inválido, mas logout deve sempre funcionar
    }
  }

  private generateAccessToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Configuração de JWT inválida', 500);
    }
    return jwt.sign({ userId, email }, secret, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new AppError('Configuração de JWT inválida', 500);
    }
    return jwt.sign({ userId, tokenId: Math.random().toString(36) }, secret, { expiresIn: '1d' });
  }
}
