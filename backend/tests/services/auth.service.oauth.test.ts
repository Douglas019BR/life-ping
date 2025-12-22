import { AuthService } from '../../src/services/auth.service';
import { AppError } from '../../src/errors/AppError';
import { prismaMock } from '../setup';

describe('AuthService OAuth CSRF Protection', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Configure Google OAuth for tests
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    authService = new AuthService(prismaMock);
  });

  describe('googleCallback', () => {
    it('should reject callback without state parameter', async () => {
      const callbackData = {
        code: 'valid-code',
        state: '',
      };

      await expect(authService.googleCallback(callbackData)).rejects.toThrow(
        new AppError('State parameter missing', 400)
      );
    });

    it('should reject callback with invalid state', async () => {
      const callbackData = {
        code: 'valid-code',
        state: 'invalid-state',
      };

      prismaMock.oAuthState.findUnique.mockResolvedValue(null);

      await expect(authService.googleCallback(callbackData)).rejects.toThrow(
        new AppError('Invalid or expired state parameter', 400)
      );
    });

    it('should reject callback with expired state', async () => {
      const callbackData = {
        code: 'valid-code',
        state: 'valid-state',
      };

      const expiredState = {
        id: '1',
        state: 'valid-state',
        expiresAt: new Date(Date.now() - 1000), // expired
        createdAt: new Date(),
      };

      prismaMock.oAuthState.findUnique.mockResolvedValue(expiredState);
      prismaMock.oAuthState.delete.mockResolvedValue(expiredState);

      await expect(authService.googleCallback(callbackData)).rejects.toThrow(
        new AppError('State parameter expired', 400)
      );

      expect(prismaMock.oAuthState.delete).toHaveBeenCalledWith({
        where: { state: 'valid-state' },
      });
    });

    it('should accept callback with valid state and delete it', async () => {
      const callbackData = {
        code: 'valid-code',
        state: 'valid-state',
      };

      const validState = {
        id: '1',
        state: 'valid-state',
        expiresAt: new Date(Date.now() + 10000), // valid
        createdAt: new Date(),
      };

      prismaMock.oAuthState.findUnique.mockResolvedValue(validState);
      prismaMock.oAuthState.delete.mockResolvedValue(validState);

      // Mock Google OAuth flow to fail after state validation
      const mockGoogleClient = {
        getToken: jest.fn().mockRejectedValue(new AppError('Test error', 400)),
      };
      (authService as any).googleClient = mockGoogleClient;

      await expect(authService.googleCallback(callbackData)).rejects.toThrow();

      expect(prismaMock.oAuthState.delete).toHaveBeenCalledWith({
        where: { state: 'valid-state' },
      });
    });
  });

  describe('googleAuth', () => {
    it('should store state in database when generating auth URL', async () => {
      const authData = {
        redirectUri: 'http://localhost:3000/callback',
      };

      const mockGoogleClient = {
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/oauth/authorize'),
      };
      (authService as any).googleClient = mockGoogleClient;

      prismaMock.oAuthState.create.mockResolvedValue({
        id: '1',
        state: 'generated-state',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await authService.googleAuth(authData);

      expect(prismaMock.oAuthState.create).toHaveBeenCalledWith({
        data: {
          state: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });

      expect(result).toHaveProperty('authUrl');
      expect(result).toHaveProperty('state');
    });
  });
});
