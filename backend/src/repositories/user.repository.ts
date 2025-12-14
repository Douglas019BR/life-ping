import prisma from '../config/database';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.types';

export class UserRepository {
  async create(data: CreateUserDTO) {
    return prisma.user.create({
      data: {
        ...data,
        email: `${data.whatsapp}@temp.com`, // Temporary email for legacy users
        password: 'temp_password', // Temporary password for legacy users
      },
    });
  }

  async findAll() {
    return prisma.user.findMany({
      include: { emergencyContacts: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { emergencyContacts: true },
    });
  }

  async findByWhatsapp(whatsapp: string) {
    return prisma.user.findUnique({ where: { whatsapp } });
  }

  async update(id: string, data: UpdateUserDTO) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
