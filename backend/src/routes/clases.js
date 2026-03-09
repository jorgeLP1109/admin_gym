import express from 'express';
import { getClases, createClase, updateClase, deleteClase } from '../controllers/clasesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getClases);
router.post('/', createClase);
router.put('/:id', updateClase);
router.delete('/:id', deleteClase);

export default router;
