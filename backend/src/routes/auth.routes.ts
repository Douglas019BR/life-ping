import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import 'express-async-errors';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export { router as authRoutes };
