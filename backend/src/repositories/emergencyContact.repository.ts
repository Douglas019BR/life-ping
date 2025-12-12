import prisma from '../config/database';
import {
  CreateEmergencyContactDTO,
  UpdateEmergencyContactDTO,
} from '../models/emergencyContacts.types';
import { Prisma } from '@prisma/client';

export class EmergencyContactRepository {
  async create(data: CreateEmergencyContactDTO) {
    return prisma.emergencyContact.create({ data });
  }

  async findAll() {
    return prisma.emergencyContact.findMany();
  }

  async findById(id: string) {
    return prisma.emergencyContact.findUnique({
      where: { id },
    });
  }

  async findFirst(args: Prisma.EmergencyContactFindFirstArgs) {
    return prisma.emergencyContact.findFirst(args);
  }

  async findByWhatsapp(whatsapp: string) {
    return prisma.emergencyContact.findMany({ where: { whatsapp } });
  }

  async findByUserId(userId: string) {
    return prisma.emergencyContact.findMany({ where: { userId } });
  }

  async findByUserIdAndOrder(userId: string, order: number) {
    return prisma.emergencyContact.findFirst({
      where: { userId, order },
    });
  }

  async findManyByIds(ids: string[]) {
    return prisma.emergencyContact.findMany({
      where: { id: { in: ids } },
    });
  }

  async countContactsByUserId(userId: string) {
    return prisma.emergencyContact.count({ where: { userId } });
  }

  async update(id: string, data: UpdateEmergencyContactDTO) {
    return prisma.emergencyContact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.emergencyContact.delete({ where: { id } });
  }
}
