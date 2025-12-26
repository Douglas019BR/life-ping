import { Router } from 'express';
import { EmergencyContactController } from '../controllers/emergencyContact.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const emergencyContactController = new EmergencyContactController();

router.use(authMiddleware);

router.post('/', emergencyContactController.create);
router.get('/', emergencyContactController.getAll);
router.put('/user/:userId/bulk', emergencyContactController.updateMultiple);
router.get('/user/:userId', emergencyContactController.getByUserId);
router.get('/:id', emergencyContactController.getById);
router.put('/:id', emergencyContactController.update);
router.delete('/:id', emergencyContactController.delete);

export default router;
