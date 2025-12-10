import { UserService } from '../../src/services/user.service';
import { AppError } from '../../src/errors/AppError';
import { prismaMock } from '../setup';
import { User } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        whatsapp: '1234567890',
        checkTime: '10:00',
      };
      const expectedUser: User = {
        id: '1',
        ...userData,
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(expectedUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual(expectedUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { whatsapp: userData.whatsapp },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data: userData });
    });

    it('should throw an AppError if whatsapp is already registered', async () => {
      const userData = {
        name: 'Test User',
        whatsapp: '1234567890',
        checkTime: '10:00',
      };
      const existingUser: User = {
        id: '1',
        ...userData,
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      await expect(userService.createUser(userData)).rejects.toThrow(
        new AppError('WhatsApp already registered', 409)
      );
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const user: User = {
        id: '1',
        name: 'Test User',
        whatsapp: '1234567890',
        checkTime: '10:00',
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await userService.getUserById('1');

      expect(result).toEqual(user);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw an AppError if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserById('1')).rejects.toThrow(
        new AppError('User not found', 404)
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser: User = {
        id: '1',
        name: 'Updated Name',
        whatsapp: '1234567890',
        checkTime: '10:00',
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateData);

      expect(result).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should throw an error if whatsapp is already in use by another user', async () => {
      const updateData = { whatsapp: '111' };
      const existingUser: User = {
        id: '2',
        name: 'Existing User',
        whatsapp: '111',
        checkTime: '10:00',
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      await expect(userService.updateUser('1', updateData)).rejects.toThrow(
        new AppError('WhatsApp already registered', 409)
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const deletedUser: User = {
        id: '1',
        name: 'Test User',
        whatsapp: '1234567890',
        checkTime: '10:00',
        isActive: true,
        paymentStatus: 'pending',
        customMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.delete.mockResolvedValue(deletedUser);

      await userService.deleteUser('1');

      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an error if user to delete is not found', async () => {
      prismaMock.user.delete.mockRejectedValue(new Error('Record to delete does not exist.'));

      await expect(userService.deleteUser('1')).rejects.toThrow(
        'Record to delete does not exist.'
      );
    });
  });
});
