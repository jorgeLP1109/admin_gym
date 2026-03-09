import express from 'express';
import { getTransacciones, createTransaccion, getResumenContable, deleteTransaccion } from '../controllers/contabilidadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/transacciones', getTransacciones);
router.post('/transacciones', createTransaccion);
router.delete('/transacciones/:id', deleteTransaccion);
router.get('/resumen', getResumenContable);

export default router;
