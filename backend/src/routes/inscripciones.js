import express from 'express';
import { getInscripciones, getInscripcionesByEstudiante, createInscripcion, deleteInscripcion } from '../controllers/inscripcionesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInscripciones);
router.get('/estudiante/:estudiante_id', getInscripcionesByEstudiante);
router.post('/', createInscripcion);
router.delete('/:id', deleteInscripcion);

export default router;
