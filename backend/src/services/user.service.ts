import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.types';
import { AppError } from '../errors/AppError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: CreateUserDTO) {
    if (!data.googleId && !data.password) {
      throw new AppError('Password is required for email registration', 400);
    }

    if (data.whatsapp) {
      const existingUser = await this.userRepository.findByWhatsapp(data.whatsapp);
      if (existingUser) {
        throw new AppError('WhatsApp already registered', 409);
      }
    }

    return this.userRepository.create(data);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    if (data.whatsapp) {
      const existingUser = await this.userRepository.findByWhatsapp(data.whatsapp);
      if (existingUser && existingUser.id !== id) {
        throw new AppError('WhatsApp already registered', 409);
      }
    }
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}
