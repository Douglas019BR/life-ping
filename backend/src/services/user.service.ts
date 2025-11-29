import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.types';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: CreateUserDTO) {
    const existingUser = await this.userRepository.findByWhatsapp(data.whatsapp);
    if (existingUser) {
      throw new Error('WhatsApp already registered');
    }
    return this.userRepository.create(data);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    await this.getUserById(id);
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    return this.userRepository.delete(id);
  }
}
