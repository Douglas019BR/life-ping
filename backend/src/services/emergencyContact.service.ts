import { EmergencyContactRepository } from '../repositories/emergencyContact.repository';
import { CreateEmergencyContactDTO, UpdateEmergencyContactDTO } from '../models/emergencyContacts.types';
import { AppError } from '../errors/AppError';

export class EmergencyContactService {
  private emergencyContactRepository: EmergencyContactRepository;

  constructor() {
    this.emergencyContactRepository = new EmergencyContactRepository();
  }

  async createEmergencyContact(data: CreateEmergencyContactDTO) {
    return this.emergencyContactRepository.create(data);
  }

  async getAllEmergencyContacts() {
    return this.emergencyContactRepository.findAll();
  }

  async getEmergencyContactById(id: string) {
    const emergencyContact = await this.emergencyContactRepository.findById(id);
    return emergencyContact;
  }

    async getEmergencyContactsByUserId(userId: string) {
    return this.emergencyContactRepository.findByUserId(userId);
  }

  async updateEmergencyContact(id: string, data: UpdateEmergencyContactDTO) {
    return this.emergencyContactRepository.update(id, data);
  }

  async deleteEmergencyContact(id: string) {
    return this.emergencyContactRepository.delete(id);
  }
}