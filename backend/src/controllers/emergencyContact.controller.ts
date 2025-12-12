import { Request, Response } from 'express';
import { EmergencyContactService } from '../services/emergencyContact.service';
import {
  CreateEmergencyContactSchema,
  UpdateEmergencyContactSchema,
  UpdateMultipleEmergencyContactsSchema,
} from '../models/emergencyContacts.types';

export class EmergencyContactController {
  private emergencyContactService: EmergencyContactService;

  constructor() {
    this.emergencyContactService = new EmergencyContactService();
  }

  create = async (req: Request, res: Response) => {
    const data = CreateEmergencyContactSchema.parse(req.body);
    const emergencyContact = await this.emergencyContactService.createEmergencyContact(data);
    res.status(201).json(emergencyContact);
  };

  getAll = async (req: Request, res: Response) => {
    const emergencyContacts = await this.emergencyContactService.getAllEmergencyContacts();
    res.json(emergencyContacts);
  };

  getById = async (req: Request, res: Response) => {
    const emergencyContact = await this.emergencyContactService.getEmergencyContactById(
      req.params.id
    );
    res.json(emergencyContact);
  };

  getByUserId = async (req: Request, res: Response) => {
    const emergencyContacts = await this.emergencyContactService.getEmergencyContactsByUserId(
      req.params.userId
    );
    res.json(emergencyContacts);
  };

  update = async (req: Request, res: Response) => {
    const data = UpdateEmergencyContactSchema.parse(req.body);
    const emergencyContact = await this.emergencyContactService.updateEmergencyContact(
      req.params.id,
      data
    );
    res.json(emergencyContact);
  };

  updateMultiple = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const data = UpdateMultipleEmergencyContactsSchema.parse(req.body);
    const emergencyContacts =
      await this.emergencyContactService.updateMultipleEmergencyContacts(data, userId);
    res.json(emergencyContacts);
  };

  delete = async (req: Request, res: Response) => {
    await this.emergencyContactService.deleteEmergencyContact(req.params.id);
    res.status(204).send();
  };
}
