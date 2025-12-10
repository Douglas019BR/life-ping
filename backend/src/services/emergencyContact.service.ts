import { EmergencyContactRepository } from '../repositories/emergencyContact.repository';
import {
  CreateEmergencyContactDTO,
  UpdateEmergencyContactDTO,
  UpdateMultipleEmergencyContactsDTO,
} from '../models/emergencyContacts.types';
import { AppError } from '../errors/AppError';

export class EmergencyContactService {
  private emergencyContactRepository: EmergencyContactRepository;

  constructor() {
    this.emergencyContactRepository = new EmergencyContactRepository();
  }

  async createEmergencyContact(data: CreateEmergencyContactDTO) {
    const contacts = await this.emergencyContactRepository.countContactsByUserId(data.userId);
    if (contacts >= 3) {
      throw new AppError('User cannot have more than 3 emergency contacts.', 409);
    }

    const existingContact = await this.emergencyContactRepository.findFirst({
      where: { userId: data.userId, order: data.order },
    });

    if (existingContact) {
      throw new AppError('Emergency contact with this order already exists.', 409);
    }

    return this.emergencyContactRepository.create(data);
  }

  async getAllEmergencyContacts() {
    return this.emergencyContactRepository.findAll();
  }

  async getEmergencyContactById(id: string) {
    const emergencyContact = await this.emergencyContactRepository.findById(id);
    if (!emergencyContact) {
      throw new AppError('Emergency contact not found.', 404);
    }
    return emergencyContact;
  }

  async getEmergencyContactsByUserId(userId: string) {
    return this.emergencyContactRepository.findByUserId(userId);
  }

  async updateEmergencyContact(id: string, data: UpdateEmergencyContactDTO) {
    const contact = await this.emergencyContactRepository.findById(id);
    if (!contact) {
      throw new AppError('Emergency contact not found.', 404);
    }

    if (data.order) {
      const existingContact = await this.emergencyContactRepository.findFirst({
        where: { userId: contact.userId, order: data.order, NOT: { id } },
      });
      if (existingContact) {
        throw new AppError('Emergency contact with this order already exists.', 409);
      }
    }

    return this.emergencyContactRepository.update(id, data);
  }

  async updateMultipleEmergencyContacts(data: UpdateMultipleEmergencyContactsDTO) {
    const orders = data.contacts.map((c) => c.order);
    if (new Set(orders).size !== orders.length) {
      throw new AppError('Duplicate orders are not allowed', 409);
    }

    // This is not fully atomic, but it's a trade-off for simplicity
    // A more robust solution would involve a database transaction
    return Promise.all(
      data.contacts.map((contact) =>
        this.emergencyContactRepository.update(contact.id, {
          name: contact.name,
          whatsapp: contact.whatsapp,
          order: contact.order,
        })
      )
    );
  }

  async deleteEmergencyContact(id: string) {
    return this.emergencyContactRepository.delete(id);
  }
}
