import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserSchema, UpdateUserSchema } from '../models/user.types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  create = async (req: Request, res: Response) => {
    const data = CreateUserSchema.parse(req.body);
    const user = await this.userService.createUser(data);
    res.status(201).json(user);
  };

  getAll = async (req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();
    res.json(users);
  };

  getById = async (req: Request, res: Response) => {
    const user = await this.userService.getUserById(req.params.id);
    res.json(user);
  };

  update = async (req: Request, res: Response) => {
    const data = UpdateUserSchema.parse(req.body);
    const user = await this.userService.updateUser(req.params.id, data);
    res.json(user);
  };

  delete = async (req: Request, res: Response) => {
    await this.userService.deleteUser(req.params.id);
    res.status(204).send();
  };
}
