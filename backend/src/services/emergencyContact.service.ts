import { EmergencyContactRepository } from '../repositories/emergencyContact.repository';
import {
  CreateEmergencyContactDTO,
  UpdateEmergencyContactDTO,
  UpdateMultipleEmergencyContactsDTO,
} from '../models/emergencyContacts.types';
import { AppError } from '../errors/AppError';
import { EmergencyContact } from '@prisma/client';
import prisma from '../config/database';

export class EmergencyContactService {
  private emergencyContactRepository: EmergencyContactRepository;

  constructor() {
    this.emergencyContactRepository = new EmergencyContactRepository();
  }

  async createEmergencyContact(data: CreateEmergencyContactDTO) {
    const contacts = await this.emergencyContactRepository.countContactsByUserId(data.userId);
    if (contacts >= 3) {
      throw new AppError('User cannot have more than 3 emergency contacts', 409);
    }

    const existingContact = await this.emergencyContactRepository.findFirst({
      where: { userId: data.userId, order: data.order },
    });

    if (existingContact) {
      throw new AppError('Emergency contact with this order already exists', 409);
    }

    return this.emergencyContactRepository.create(data);
  }

  async getAllEmergencyContacts() {
    return this.emergencyContactRepository.findAll();
  }

  async getEmergencyContactById(id: string) {
    const emergencyContact = await this.emergencyContactRepository.findById(id);
    if (!emergencyContact) {
      throw new AppError('Emergency contact not found', 404);
    }
    return emergencyContact;
  }

  async getEmergencyContactsByUserId(userId: string) {
    return this.emergencyContactRepository.findByUserId(userId);
  }

  async updateEmergencyContact(id: string, data: UpdateEmergencyContactDTO) {
    const contact = await this.emergencyContactRepository.findById(id);
    if (!contact) {
      throw new AppError('Emergency contact not found', 404);
    }

    if (data.order) {
      const existingContact = await this.emergencyContactRepository.findFirst({
        where: { userId: contact.userId, order: data.order, NOT: { id } },
      });
      if (existingContact) {
        throw new AppError('Emergency contact with this order already exists', 409);
      }
    }

    return this.emergencyContactRepository.update(id, data);
  }

  async updateMultipleEmergencyContacts(data: UpdateMultipleEmergencyContactsDTO, userId: string) {
    const orders = data.contacts.map((c) => c.order);
    if (new Set(orders).size !== orders.length) {
      throw new AppError('Duplicate orders are not allowed', 409);
    }

    const contactIds = data.contacts.map((contact) => contact.id);
    const existingContacts = await this.emergencyContactRepository.findManyByIds(contactIds);
    const existingIds = new Set(existingContacts.map((c) => c.id));

    await this.ensureAllContactsExists(contactIds, existingIds);
    await this.ensureAllContactsBelongToUser(existingContacts, userId);

    return prisma.$transaction(
      data.contacts.map((contact) =>
        prisma.emergencyContact.update({
          where: { id: contact.id },
          data: {
            name: contact.name,
            whatsapp: contact.whatsapp,
            order: contact.order,
          },
        })
      )
    );
  }

  private async ensureAllContactsExists(contactIds: string[], existingContactsIds: Set<string>) {
    for (const id of contactIds) {
      if (!existingContactsIds.has(id)) {
        throw new AppError(`Emergency contact with id ${id} not found`, 404);
      }
    }
  }

  private async ensureAllContactsBelongToUser(contacts: EmergencyContact[], userId: string) {
    const invalidContacts = contacts.filter((c) => c.userId !== userId);
    if (invalidContacts.length > 0) {
      throw new AppError('All contacts must belong to the specified user', 403);
    }
  }

  async deleteEmergencyContact(id: string) {
    return this.emergencyContactRepository.delete(id);
  }
}
