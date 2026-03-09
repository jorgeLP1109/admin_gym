import express from 'express';
import { getAsistencias, createAsistencia, getReporteAsistencias } from '../controllers/asistenciasController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAsistencias);
router.post('/', createAsistencia);
router.get('/reporte', getReporteAsistencias);

export default router;
