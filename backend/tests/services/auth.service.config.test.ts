import { AuthService } from '../../src/services/auth.service';
import { AppError } from '../../src/errors/AppError';
import { prismaMock } from '../setup';

describe('AuthService Google OAuth Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not throw error when Google OAuth credentials are missing', () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    expect(() => new AuthService(prismaMock)).not.toThrow();
  });

  it('should throw AppError when googleAuth is called without configuration', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const authService = new AuthService(prismaMock);
    const authData = { redirectUri: 'http://localhost:3000/callback' };

    await expect(authService.googleAuth(authData)).rejects.toThrow(
      new AppError('Google OAuth not configured', 500)
    );
  });

  it('should throw AppError when googleCallback is called without configuration', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const authService = new AuthService(prismaMock);
    const callbackData = { code: 'test-code', state: 'test-state' };

    await expect(authService.googleCallback(callbackData)).rejects.toThrow(
      new AppError('Google OAuth not configured', 500)
    );
  });

  it('should work normally when Google OAuth credentials are provided', () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    expect(() => new AuthService(prismaMock)).not.toThrow();
  });
});
