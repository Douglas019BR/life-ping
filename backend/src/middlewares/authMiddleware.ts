import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';
import { JWTPayload } from '../models/auth.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401);
  }

  const token = authHeader.replace('Bearer ', '');

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('Configuração de JWT inválida', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    throw new AppError('Token inválido', 401);
  }
};
