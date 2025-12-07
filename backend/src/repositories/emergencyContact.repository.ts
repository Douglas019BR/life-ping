import prisma from '../config/database';
import { CreateEmergencyContactDTO, UpdateEmergencyContactDTO } from '../models/emergencyContacts.types';

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

  async findByWhatsapp(whatsapp: string) {
    return prisma.emergencyContact.findUnique({ where: { whatsapp } });
  }

  async findByUserId(userId: string) {
    return prisma.emergencyContact.findMany({ where: { userId } });
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
