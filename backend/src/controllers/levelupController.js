import { query } from '../config/database.js';
import * as levelup from '../services/levelupService.js';

// Obtener usuarios de Level Up
export const getLevelUpUsers = async (req, res) => {
  try {
    const users = await levelup.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios de Level Up' });
  }
};

// Obtener clases de Level Up
export const getLevelUpClasses = async (req, res) => {
  try {
    const classes = await levelup.getClasses();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clases de Level Up' });
  }
};

// Sincronizar transacciones de Wompi desde Level Up
export const syncTransacciones = async (req, res) => {
  try {
    const transacciones = await levelup.getTransacciones();
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al sincronizar transacciones' });
  }
};

// Registrar pago manual y sincronizar con Level Up
export const registrarPagoManual = async (req, res) => {
  try {
    const { userId, classId, monto, metodo_pago, referencia, notas, alumno_nombre } = req.body;

    // 1. Calcular fecha de vencimiento (30 días desde hoy)
    const fechaPago = new Date().toISOString().split('T')[0];
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const fechaVencimientoStr = fechaVencimiento.toISOString();

    // 2. Enrollar en Level Up (renueva 30 días)
    await levelup.enrollUser(classId, userId);

    // 3. Actualizar solvencia del usuario en Level Up
    await levelup.updateUserSolvencia(userId, fechaVencimientoStr);

    // 4. Registrar en contabilidad local
    await query(
      `INSERT INTO transacciones_contables (tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, notas, tercero_nombre)
       VALUES ('ingreso', 'Mensualidad App', $1, $2, $3, $4, $5, $6, $7)`,
      [`Pago manual - ${alumno_nombre}`, monto, fechaPago, metodo_pago, referencia, notas, alumno_nombre]
    );

    res.status(201).json({
      message: 'Pago registrado y solvencia actualizada en Level Up',
      fechaVencimiento: fechaVencimientoStr
    });
  } catch (error) {
    console.error('Error pago manual:', error.message);
    res.status(500).json({ error: 'Error al registrar pago manual: ' + error.message });
  }
};
