import { Router } from 'express';
import { EmergencyContactController } from '../controllers/emergencyContact.controller';

const router = Router();
const emergencyContactController = new EmergencyContactController();

router.post('/', emergencyContactController.create);
router.get('/', emergencyContactController.getAll);
router.get('/:id', emergencyContactController.getById);
router.get('/user/:userId', emergencyContactController.getByUserId);
router.put('/bulk', emergencyContactController.updateMultiple);
router.put('/:id', emergencyContactController.update);
router.delete('/:id', emergencyContactController.delete);

export default router;
