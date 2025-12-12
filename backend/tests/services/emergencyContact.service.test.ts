import { EmergencyContactService } from '../../src/services/emergencyContact.service';
import { prismaMock } from '../setup';
import { EmergencyContact } from '@prisma/client';
import { AppError } from '../../src/errors/AppError';

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

      prismaMock.emergencyContact.count.mockResolvedValue(0);
      prismaMock.emergencyContact.create.mockResolvedValue(expectedContact);

      const result = await service.createEmergencyContact(contactData);

      expect(result).toEqual(expectedContact);
      expect(prismaMock.emergencyContact.create).toHaveBeenCalledWith({ data: contactData });
    });

    it('should throw an error if user already has 3 contacts', async () => {
      const contactData = {
        userId: '123',
        name: 'John Doe',
        whatsapp: '1234567890',
        order: 1,
      };

      prismaMock.emergencyContact.count.mockResolvedValue(3);

      await expect(service.createEmergencyContact(contactData)).rejects.toThrow(
        new AppError('User cannot have more than 3 emergency contacts', 409)
      );
    });

    it('should throw 409 when userId/order combination already exists', async () => {
      const contactData = {
        userId: '123',
        name: 'John Doe',
        whatsapp: '1234567890',
        order: 1,
      };

      prismaMock.emergencyContact.count.mockResolvedValue(0);
      prismaMock.emergencyContact.findFirst.mockResolvedValue({} as EmergencyContact);

      await expect(service.createEmergencyContact(contactData)).rejects.toThrow(
        new AppError('Emergency contact with this order already exists', 409)
      );
    });
  });

  describe('getAllEmergencyContacts', () => {
    it('should return all emergency contacts', async () => {
      const mockContacts: EmergencyContact[] = [
        {
          id: '1',
          userId: '123',
          name: 'Contact 1',
          whatsapp: '111',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: '456',
          name: 'Contact 2',
          whatsapp: '222',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.emergencyContact.findMany.mockResolvedValue(mockContacts);

      const result = await service.getAllEmergencyContacts();

      expect(result).toEqual(mockContacts);
      expect(prismaMock.emergencyContact.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array when no contacts exist', async () => {
      prismaMock.emergencyContact.findMany.mockResolvedValue([]);

      const result = await service.getAllEmergencyContacts();

      expect(result).toEqual([]);
      expect(prismaMock.emergencyContact.findMany).toHaveBeenCalledWith();
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

    it('should throw 404 when contact is not found', async () => {
      prismaMock.emergencyContact.findUnique.mockResolvedValue(null);

      await expect(service.getEmergencyContactById('1')).rejects.toThrow(
        new AppError('Emergency contact not found', 404)
      );
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

      prismaMock.emergencyContact.findUnique.mockResolvedValue({
        id: '1',
        userId: '123',
      } as EmergencyContact);
      prismaMock.emergencyContact.update.mockResolvedValue(updatedContact);

      const result = await service.updateEmergencyContact('1', updateData);

      expect(result).toEqual(updatedContact);
      expect(prismaMock.emergencyContact.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });

    it('should throw 404 when emergency contact is not found', async () => {
      const updateData = { name: 'Updated Name' };

      prismaMock.emergencyContact.findUnique.mockResolvedValue(null);

      await expect(service.updateEmergencyContact('1', updateData)).rejects.toThrow(
        new AppError('Emergency contact not found', 404)
      );
    });

    it('should throw an error when order conflicts with existing contact', async () => {
      const updateData = { order: 2 };

      prismaMock.emergencyContact.findUnique.mockResolvedValue({
        id: '1',
        userId: '123',
      } as EmergencyContact);
      prismaMock.emergencyContact.findFirst.mockResolvedValue({
        id: '2',
      } as EmergencyContact);

      await expect(service.updateEmergencyContact('1', updateData)).rejects.toThrow(
        new AppError('Emergency contact with this order already exists', 409)
      );
    });
  });

  describe('updateMultipleEmergencyContacts', () => {
    const userId = '123';
    it('should update multiple contacts successfully within a transaction', async () => {
      const contactsToUpdate = {
        contacts: [
          { id: '1', name: 'Contact 1', whatsapp: '111', order: 1 },
          { id: '2', name: 'Contact 2', whatsapp: '222', order: 2 },
        ],
      };
      const updatedContacts = contactsToUpdate.contacts.map(c => ({ ...c, userId, createdAt: new Date(), updatedAt: new Date() }));

      prismaMock.emergencyContact.findMany.mockResolvedValue(updatedContacts);
      prismaMock.$transaction.mockResolvedValue(updatedContacts);

      const result = await service.updateMultipleEmergencyContacts(contactsToUpdate, userId);

      expect(result.length).toBe(2);
      expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should throw an error for duplicate orders', async () => {
      const contactsToUpdate = {
        contacts: [
          { id: '1', name: 'Contact 1', whatsapp: '111', order: 1 },
          { id: '2', name: 'Contact 2', whatsapp: '222', order: 1 },
        ],
      };

      await expect(service.updateMultipleEmergencyContacts(contactsToUpdate, userId)).rejects.toThrow(
        new AppError('Duplicate orders are not allowed', 409)
      );
    });

    it('should throw 404 when contact to update is not found', async () => {
      const contactsToUpdate = {
        contacts: [
          { id: 'non-existent', name: 'Contact 1', whatsapp: '111', order: 1 },
        ],
      };

      prismaMock.emergencyContact.findMany.mockResolvedValue([]);

      await expect(service.updateMultipleEmergencyContacts(contactsToUpdate, userId)).rejects.toThrow(
        new AppError('Emergency contact with id non-existent not found', 404)
      );
    });

    it('should throw 403 when contacts belong to a different user', async () => {
      const contactsToUpdate = {
        contacts: [
          { id: '1', name: 'Contact 1', whatsapp: '111', order: 1 },
          { id: '2', name: 'Contact 2', whatsapp: '222', order: 2 },
        ],
      };

      prismaMock.emergencyContact.findMany.mockResolvedValue([
        {
          id: '1',
          userId: '123',
          name: 'Contact 1',
          whatsapp: '111',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: '456', // Different userId
          name: 'Contact 2',
          whatsapp: '222',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as EmergencyContact[]);

      await expect(service.updateMultipleEmergencyContacts(contactsToUpdate, userId)).rejects.toThrow(
        new AppError('All contacts must belong to the specified user', 403)
      );
    });

    it('should throw an error if the transaction fails', async () => {
      const contactsToUpdate = {
        contacts: [
          { id: '1', name: 'Contact 1', whatsapp: '111', order: 1 },
          { id: '2', name: 'Contact 2', whatsapp: '222', order: 2 },
        ],
      };
      const updatedContacts = contactsToUpdate.contacts.map(c => ({ ...c, userId, createdAt: new Date(), updatedAt: new Date() }));
      const error = new Error('Transaction failed');

      prismaMock.emergencyContact.findMany.mockResolvedValue(updatedContacts);
      prismaMock.$transaction.mockRejectedValue(error);

      await expect(service.updateMultipleEmergencyContacts(contactsToUpdate, userId)).rejects.toThrow(error);
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

    it('should throw an error if contact to delete is not found', async () => {
      prismaMock.emergencyContact.delete.mockRejectedValue(new Error('Record to delete does not exist.'));

      await expect(service.deleteEmergencyContact('1')).rejects.toThrow(
        'Record to delete does not exist.'
      );
    });
  });
});
