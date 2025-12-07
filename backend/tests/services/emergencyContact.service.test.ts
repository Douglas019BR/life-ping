import { EmergencyContactService } from '../../src/services/emergencyContact.service';
import { prismaMock } from '../setup';
import { EmergencyContact } from '@prisma/client';

describe('EmergencyContactService', () => {
  let service: EmergencyContactService;

  beforeEach(() => {
    service = new EmergencyContactService();
  });

  describe('createEmergencyContact', () => {
    it('should create a new emergency contact successfully', async () => {
      const contactData = {
        userId: '123',
        name: 'John Doe',
        whatsapp: '1234567890',
        order: 1,
      };
      const expectedContact: EmergencyContact = {
        id: '1',
        ...contactData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.emergencyContact.create.mockResolvedValue(expectedContact);

      const result = await service.createEmergencyContact(contactData);

      expect(result).toEqual(expectedContact);
      expect(prismaMock.emergencyContact.create).toHaveBeenCalledWith({ data: contactData });
    });
  });

  describe('getEmergencyContactById', () => {
    it('should return an emergency contact if found', async () => {
      const contact: EmergencyContact = {
        id: '1',
        userId: '123',
        name: 'John Doe',
        whatsapp: '1234567890',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.emergencyContact.findUnique.mockResolvedValue(contact);

      const result = await service.getEmergencyContactById('1');

      expect(result).toEqual(contact);
      expect(prismaMock.emergencyContact.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getEmergencyContactsByUserId', () => {
    it('should return all emergency contacts for a user', async () => {
      const contacts: EmergencyContact[] = [
        {
          id: '1',
          userId: '123',
          name: 'John Doe',
          whatsapp: '1234567890',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: '123',
          name: 'Jane Doe',
          whatsapp: '0987654321',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.emergencyContact.findMany.mockResolvedValue(contacts);

      const result = await service.getEmergencyContactsByUserId('123');

      expect(result).toEqual(contacts);
      expect(prismaMock.emergencyContact.findMany).toHaveBeenCalledWith({
        where: { userId: '123' },
      });
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update an emergency contact successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedContact: EmergencyContact = {
        id: '1',
        userId: '123',
        name: 'Updated Name',
        whatsapp: '1234567890',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.emergencyContact.update.mockResolvedValue(updatedContact);

      const result = await service.updateEmergencyContact('1', updateData);

      expect(result).toEqual(updatedContact);
      expect(prismaMock.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete an emergency contact successfully', async () => {
      const deletedContact: EmergencyContact = {
        id: '1',
        userId: '123',
        name: 'John Doe',
        whatsapp: '1234567890',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.emergencyContact.delete.mockResolvedValue(deletedContact);

      await service.deleteEmergencyContact('1');

      expect(prismaMock.emergencyContact.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
