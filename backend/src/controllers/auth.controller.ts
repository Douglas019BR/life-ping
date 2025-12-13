import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginSchema, RegisterSchema, RefreshTokenSchema } from '../models/auth.types';
import prisma from '../config/database';

const authService = new AuthService(prisma);

export class AuthController {
  async login(req: Request, res: Response) {
    const data = LoginSchema.parse(req.body);
    const result = await authService.login(data);
    res.json(result);
  }

  async register(req: Request, res: Response) {
    const data = RegisterSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  }

  async refresh(req: Request, res: Response) {
    const data = RefreshTokenSchema.parse(req.body);
    const result = await authService.refresh(data);
    res.json(result);
  }

  async logout(req: Request, res: Response) {
    const data = RefreshTokenSchema.parse(req.body);
    await authService.logout(data.refreshToken);
    res.status(204).send();
  }
}
