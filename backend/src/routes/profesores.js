import express from 'express';
import { getProfesores, createProfesor, updateProfesor, deleteProfesor } from '../controllers/profesoresController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProfesores);
router.post('/', createProfesor);
router.put('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);

export default router;
