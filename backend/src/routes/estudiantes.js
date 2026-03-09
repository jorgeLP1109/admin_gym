import express from 'express';
import { getEstudiantes, getEstudianteById, createEstudiante, updateEstudiante, deleteEstudiante } from '../controllers/estudiantesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEstudiantes);
router.get('/:id', getEstudianteById);
router.post('/', createEstudiante);
router.put('/:id', updateEstudiante);
router.delete('/:id', deleteEstudiante);

export default router;
