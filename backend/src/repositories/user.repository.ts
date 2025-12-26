import prisma from '../config/database';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.types';
import * as bcrypt from 'bcrypt';

export class UserRepository {
  async create(data: CreateUserDTO) {
    const userData: CreateUserDTO = { ...data };

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    return prisma.user.create({
      data: userData,
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
