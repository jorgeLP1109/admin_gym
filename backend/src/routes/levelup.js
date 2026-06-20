import express from 'express';
import { getLevelUpUsers, getLevelUpClasses, syncTransacciones, registrarPagoManual } from '../controllers/levelupController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/users', getLevelUpUsers);
router.get('/classes', getLevelUpClasses);
router.get('/transacciones', syncTransacciones);
router.post('/pago-manual', registrarPagoManual);

export default router;
