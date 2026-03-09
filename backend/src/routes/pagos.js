import express from 'express';
import { getPagos, getPagosByEstudiante, createPago, getEstudiantesSolventes, getEstudiantesMorosos } from '../controllers/pagosController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPagos);
router.get('/estudiante/:estudiante_id', getPagosByEstudiante);
router.get('/solventes', getEstudiantesSolventes);
router.get('/morosos', getEstudiantesMorosos);
router.post('/', createPago);

export default router;
