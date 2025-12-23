import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middlewares/authMiddleware';
import { AppError } from '../../src/errors/AppError';

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate valid token', () => {
    const payload = { userId: '123', email: 'test@example.com' };
    const token = jwt.sign(payload, 'test-secret');

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.user).toEqual({
      userId: '123',
      email: 'test@example.com',
    });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should throw error when no authorization header', () => {
    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Token não fornecido', 401));
  });

  it('should throw error when JWT_SECRET is not configured', () => {
    delete process.env.JWT_SECRET;

    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Configuração de JWT inválida', 500));
  });

  it('should throw error for invalid token', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Token inválido', 401));
  });

  it('should throw error for expired token', () => {
    const payload = { userId: '123', email: 'test@example.com' };
    const expiredToken = jwt.sign(payload, 'test-secret', { expiresIn: '-1h' });

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Token inválido', 401));
  });

  it('should handle malformed authorization header without Bearer prefix', () => {
    mockRequest.headers = {
      authorization: 'malformed-header',
    };

    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Token inválido', 401));
  });

  it('should handle empty authorization header', () => {
    mockRequest.headers = {
      authorization: '',
    };

    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Token não fornecido', 401));
  });

  it('should handle authorization header with only Bearer', () => {
    mockRequest.headers = {
      authorization: 'Bearer ',
    };

    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    }).toThrow(new AppError('Token inválido', 401));
  });
});
