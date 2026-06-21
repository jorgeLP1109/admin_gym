import express from 'express';
import { getCortesias, createCortesia, convertirAFormal, deleteCortesia, getEstadisticas } from '../controllers/cortesiaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getCortesias);
router.get('/estadisticas', getEstadisticas);
router.post('/', createCortesia);
router.post('/:id/convertir', convertirAFormal);
router.delete('/:id', deleteCortesia);

export default router;
