import { AuthService } from '../../src/services/auth.service';
import { AppError } from '../../src/errors/AppError';
import { prismaMock } from '../setup';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateAuthUrl: jest.fn(),
    getToken: jest.fn(),
    verifyIdToken: jest.fn(),
  })),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Setup environment variables first
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    authService = new AuthService(prismaMock);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!@#',
    };

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      whatsapp: '1234567890',
      checkTime: '14:00',
      isActive: true,
      paymentStatus: 'pending',
      customMessage: null,
      refreshToken: null,
      lastLogin: null,
      googleId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login successfully with valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      (jwtMock.sign as jest.Mock)
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.login(loginData);

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          refreshToken: 'hashedRefreshToken',
          lastLogin: expect.any(Date),
        },
      });
    });

    it('should throw error when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        new AppError('Email ou senha inválidos', 401)
      );
    });

    it('should throw error when password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        new AppError('Email ou senha inválidos', 401)
      );
    });

    it('should throw error when user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: null } as unknown as User;
      prismaMock.user.findUnique.mockResolvedValue(userWithoutPassword);

      await expect(authService.login(loginData)).rejects.toThrow(
        new AppError('Email ou senha inválidos', 401)
      );
    });
  });

  describe('register', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
      whatsapp: '1234567890',
    };

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      whatsapp: '1234567890',
      checkTime: '14:00',
      isActive: true,
      paymentStatus: 'pending',
      customMessage: null,
      refreshToken: null,
      lastLogin: new Date(),
      googleId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register successfully with valid data', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValue(mockUser);
      (bcryptMock.hash as jest.Mock)
        .mockResolvedValueOnce('hashedpassword')
        .mockResolvedValueOnce('hashedRefreshToken');
      (jwtMock.sign as jest.Mock)
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.register(registerData);

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
          whatsapp: '1234567890',
          lastLogin: expect.any(Date),
        },
      });
    });

    it('should throw error when email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        new AppError('Email já está em uso', 409)
      );
    });

    it('should throw error when whatsapp already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        new AppError('WhatsApp já está em uso', 409)
      );
    });
  });

  describe('refresh', () => {
    const refreshData = {
      refreshToken: 'validRefreshToken',
    };

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      whatsapp: '1234567890',
      checkTime: '14:00',
      isActive: true,
      paymentStatus: 'pending',
      customMessage: null,
      refreshToken: 'hashedRefreshToken',
      lastLogin: null,
      googleId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should refresh token successfully', async () => {
      const decodedToken = { userId: '1', tokenId: 'abc123' };
      (jwtMock.verify as jest.Mock).mockReturnValue(decodedToken);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      (jwtMock.sign as jest.Mock).mockReturnValue('newAccessToken');

      const result = await authService.refresh(refreshData);

      expect(result).toEqual({
        accessToken: 'newAccessToken',
      });
    });

    it('should throw error when refresh token is invalid', async () => {
      (jwtMock.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refresh(refreshData)).rejects.toThrow(
        new AppError('Token inválido', 401)
      );
    });

    it('should throw error when user not found', async () => {
      const decodedToken = { userId: '1', tokenId: 'abc123' };
      (jwtMock.verify as jest.Mock).mockReturnValue(decodedToken);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.refresh(refreshData)).rejects.toThrow(
        new AppError('Token inválido', 401)
      );
    });

    it('should throw error when stored refresh token is invalid', async () => {
      const decodedToken = { userId: '1', tokenId: 'abc123' };
      (jwtMock.verify as jest.Mock).mockReturnValue(decodedToken);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.refresh(refreshData)).rejects.toThrow(
        new AppError('Token inválido', 401)
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'validRefreshToken';
      const decodedToken = { userId: '1', tokenId: 'abc123' };
      (jwtMock.verify as jest.Mock).mockReturnValue(decodedToken);

      await authService.logout(refreshToken);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: null },
      });
    });

    it('should handle invalid token gracefully', async () => {
      const refreshToken = 'invalidToken';
      (jwtMock.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should handle missing JWT_REFRESH_SECRET gracefully', async () => {
      delete process.env.JWT_REFRESH_SECRET;
      const refreshToken = 'validRefreshToken';

      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('JWT configuration errors', () => {
    it('should throw error when JWT_SECRET is missing during login', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const loginData = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        whatsapp: '1234567890',
        checkTime: '14:00',
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        refreshToken: null,
        lastLogin: null,
        googleId: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.login(loginData)).rejects.toThrow(
        new AppError('Configuração de JWT inválida', 500)
      );

      // Restore original value
      process.env.JWT_SECRET = originalSecret;
    });

    it('should throw error when JWT_REFRESH_SECRET is missing during register', async () => {
      const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        whatsapp: '1234567890',
      };

      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        whatsapp: '1234567890',
        checkTime: '14:00',
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        refreshToken: null,
        lastLogin: new Date(),
        googleId: null,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValue(mockUser);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (jwtMock.sign as jest.Mock).mockReturnValue('accessToken');

      await expect(authService.register(registerData)).rejects.toThrow(
        new AppError('Configuração de JWT inválida', 500)
      );

      // Restore original value
      process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
    });
  });

  describe('OAuth Google', () => {
    let mockGoogleClient: {
      generateAuthUrl: jest.Mock;
      getToken: jest.Mock;
      verifyIdToken: jest.Mock;
    };

    beforeEach(() => {
      jest.requireActual('google-auth-library');
      mockGoogleClient = {
        generateAuthUrl: jest.fn(),
        getToken: jest.fn(),
        verifyIdToken: jest.fn(),
      };
      (authService as unknown as { googleClient: typeof mockGoogleClient }).googleClient =
        mockGoogleClient;
    });

    describe('googleAuth', () => {
      it('should generate auth URL successfully', async () => {
        const authData = { redirectUri: 'http://localhost:3001/callback' };
        const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?client_id=test';

        mockGoogleClient.generateAuthUrl.mockReturnValue(mockAuthUrl);

        const result = await authService.googleAuth(authData);

        expect(result.authUrl).toBe(mockAuthUrl);
        expect(result.state).toBeDefined();
        expect(typeof result.state).toBe('string');
        expect(mockGoogleClient.generateAuthUrl).toHaveBeenCalledWith({
          access_type: 'offline',
          scope: ['openid', 'email', 'profile'],
          state: result.state,
          redirect_uri: authData.redirectUri,
        });
      });
    });

    describe('googleCallback', () => {
      const callbackData = {
        code: 'test_code',
        state: 'test_state',
      };

      const mockPayload = {
        sub: 'google123',
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://avatar.url',
      };

      beforeEach(() => {
        // Mock valid state by default
        prismaMock.oAuthState.findUnique.mockResolvedValue({
          id: '1',
          state: 'test_state',
          expiresAt: new Date(Date.now() + 10000),
          createdAt: new Date(),
        });
        prismaMock.oAuthState.delete.mockResolvedValue({
          id: '1',
          state: 'test_state',
          expiresAt: new Date(),
          createdAt: new Date(),
        });
      });

      it('should create new user from Google OAuth without whatsapp', async () => {
        mockGoogleClient.getToken.mockResolvedValue({
          tokens: { id_token: 'mock_id_token' },
        });
        mockGoogleClient.verifyIdToken.mockResolvedValue({
          getPayload: () => mockPayload,
        });

        prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        const newUser: User = {
          id: '1',
          name: 'Test User',
          email: 'test@gmail.com',
          password: null,
          whatsapp: null,
          checkTime: '14:00',
          isActive: true,
          paymentStatus: 'pending',
          customMessage: null,
          refreshToken: null,
          lastLogin: new Date(),
          googleId: 'google123',
          avatarUrl: 'https://avatar.url',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prismaMock.user.create.mockResolvedValue(newUser);
        (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
        (jwtMock.sign as jest.Mock)
          .mockReturnValueOnce('accessToken')
          .mockReturnValueOnce('refreshToken');

        const result = await authService.googleCallback(callbackData);

        expect(result).toEqual({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          user: {
            id: '1',
            email: 'test@gmail.com',
            name: 'Test User',
            avatarUrl: 'https://avatar.url',
          },
        });

        expect(prismaMock.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            name: 'Test User',
            email: 'test@gmail.com',
            googleId: 'google123',
            avatarUrl: 'https://avatar.url',
          }),
        });
      });

      it('should link existing user by email', async () => {
        mockGoogleClient.getToken.mockResolvedValue({
          tokens: { id_token: 'mock_id_token' },
        });
        mockGoogleClient.verifyIdToken.mockResolvedValue({
          getPayload: () => mockPayload,
        });

        const existingUser: User = {
          id: '1',
          name: 'Old Name',
          email: 'test@gmail.com',
          password: 'hashedpassword',
          whatsapp: '1234567890',
          checkTime: '14:00',
          isActive: true,
          paymentStatus: 'pending',
          customMessage: null,
          refreshToken: null,
          lastLogin: null,
          googleId: null,
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedUser = {
          ...existingUser,
          googleId: 'google123',
          avatarUrl: 'https://avatar.url',
        };

        prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);
        prismaMock.user.update
          .mockResolvedValueOnce(updatedUser)
          .mockResolvedValueOnce(updatedUser);
        (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
        (jwtMock.sign as jest.Mock)
          .mockReturnValueOnce('accessToken')
          .mockReturnValueOnce('refreshToken');

        await authService.googleCallback(callbackData);

        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: '1' },
          data: { googleId: 'google123', avatarUrl: 'https://avatar.url' },
        });
      });

      it('should update existing OAuth user', async () => {
        mockGoogleClient.getToken.mockResolvedValue({
          tokens: { id_token: 'mock_id_token' },
        });
        mockGoogleClient.verifyIdToken.mockResolvedValue({
          getPayload: () => mockPayload,
        });

        const existingOAuthUser: User = {
          id: '1',
          name: 'Old Name',
          email: 'test@gmail.com',
          password: null,
          whatsapp: null,
          checkTime: '14:00',
          isActive: true,
          paymentStatus: 'pending',
          customMessage: null,
          refreshToken: null,
          lastLogin: null,
          googleId: 'google123',
          avatarUrl: 'old_avatar.url',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedUser = {
          ...existingOAuthUser,
          name: 'Test User',
          avatarUrl: 'https://avatar.url',
        };

        prismaMock.user.findUnique.mockResolvedValue(existingOAuthUser);
        prismaMock.user.update
          .mockResolvedValueOnce(updatedUser)
          .mockResolvedValueOnce(updatedUser);
        (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
        (jwtMock.sign as jest.Mock)
          .mockReturnValueOnce('accessToken')
          .mockReturnValueOnce('refreshToken');

        await authService.googleCallback(callbackData);

        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: '1' },
          data: {
            name: 'Test User',
            avatarUrl: 'https://avatar.url',
            lastLogin: expect.any(Date),
          },
        });
      });

      it('should throw error when no ID token received', async () => {
        mockGoogleClient.getToken.mockResolvedValue({
          tokens: { access_token: 'access_token' },
        });

        await expect(authService.googleCallback(callbackData)).rejects.toThrow(
          new AppError('ID Token não recebido do Google', 400)
        );
      });

      it('should throw error when ID token payload is invalid', async () => {
        mockGoogleClient.getToken.mockResolvedValue({
          tokens: { id_token: 'mock_id_token' },
        });
        mockGoogleClient.verifyIdToken.mockResolvedValue({
          getPayload: () => null,
        });

        await expect(authService.googleCallback(callbackData)).rejects.toThrow(
          new AppError('Payload do ID Token inválido', 400)
        );
      });

      it('should throw error when required data is missing', async () => {
        mockGoogleClient.getToken.mockResolvedValue({
          tokens: { id_token: 'mock_id_token' },
        });
        mockGoogleClient.verifyIdToken.mockResolvedValue({
          getPayload: () => ({ sub: 'google123', email: null, name: 'Test' }),
        });

        await expect(authService.googleCallback(callbackData)).rejects.toThrow(
          new AppError('Dados obrigatórios não encontrados no Google', 400)
        );
      });
    });
  });
});
