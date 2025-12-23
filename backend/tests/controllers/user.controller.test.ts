import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/user.controller';
import { UserService } from '../../src/services/user.service';
import { AppError } from '../../src/errors/AppError';
import { User } from '@prisma/client';

jest.mock('../../src/services/user.service');
const MockedUserService = UserService as jest.MockedClass<typeof UserService>;

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUserService = new MockedUserService() as jest.Mocked<UserService>;
    userController = new UserController();
    Object.defineProperty(userController, 'userService', {
      value: mockUserService,
      writable: true,
    });

    mockRequest = {
      body: {},
      params: {},
      user: undefined,
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding successfully', async () => {
      const whatsapp = '5511999999999';
      const userId = 'user123';
      const updatedUser: Partial<User> = {
        id: userId,
        name: 'Google User',
        email: 'google@example.com',
        whatsapp,
      };

      mockRequest.body = { whatsapp };
      mockRequest.user = { userId, email: 'google@example.com' };
      mockUserService.updateUser.mockResolvedValue(updatedUser as User);

      await userController.completeOnboarding(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, { whatsapp });
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw error if user not authenticated', async () => {
      mockRequest.body = { whatsapp: '5511999999999' };
      mockRequest.user = undefined;

      await expect(
        userController.completeOnboarding(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(new AppError('User not authenticated', 401));
    });

    it('should throw error if whatsapp not provided', async () => {
      mockRequest.body = {};
      mockRequest.user = { userId: 'user123', email: 'test@example.com' };

      await expect(
        userController.completeOnboarding(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(new AppError('WhatsApp is required', 400));
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        whatsapp: '5511999999999',
        checkTime: '14:00',
      };
      const createdUser: Partial<User> = { id: '1', ...userData };

      mockRequest.body = userData;
      mockUserService.createUser.mockResolvedValue(createdUser as User);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
    });
  });
});
