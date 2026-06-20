import { query } from '../config/database.js';
import * as levelup from '../services/levelupService.js';

export const getLevelUpUsers = async (req, res) => {
  try {
    const users = await levelup.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios de Level Up' });
  }
};

export const getLevelUpClasses = async (req, res) => {
  try {
    const classes = await levelup.getClasses();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clases de Level Up' });
  }
};

// Sincronizar transacciones Wompi y registrarlas en contabilidad
export const syncTransacciones = async (req, res) => {
  try {
    const transacciones = await levelup.getTransacciones();
    let nuevas = 0;

    for (const t of transacciones) {
      if (t.estado !== 'APPROVED') continue;

      // Verificar si ya existe por referencia
      const existe = await query(
        'SELECT id FROM transacciones_contables WHERE referencia = $1',
        [t.referencia]
      );

      if (existe.rows.length === 0) {
        await query(
          `INSERT INTO transacciones_contables (tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, tercero_nombre)
           VALUES ('ingreso', 'Pago App Wompi', $1, $2, $3, 'wompi', $4, $5)`,
          [
            t.conceptos || t.items?.map(i => i.nombre).join(', ') || 'Pago App',
            t.monto,
            t.fecha ? t.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
            t.referencia,
            t.alumno?.nombre || 'N/A'
          ]
        );
        nuevas++;
      }
    }

    res.json({ transacciones, sincronizadas: nuevas });
  } catch (error) {
    console.error('Error sync:', error.message);
    res.status(500).json({ error: 'Error al sincronizar transacciones' });
  }
};

// Registrar pago manual y sincronizar con Level Up
export const registrarPagoManual = async (req, res) => {
  try {
    const { userId, classId, monto, metodo_pago, referencia, notas, alumno_nombre, clase_nombre } = req.body;

    const fechaPago = new Date().toISOString().split('T')[0];
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const fechaVencimientoStr = fechaVencimiento.toISOString();

    // 1. Enrollar en Level Up (renueva 30 días)
    await levelup.enrollUser(classId, userId);

    // 2. Actualizar solvencia en Level Up
    await levelup.updateUserSolvencia(userId, fechaVencimientoStr);

    // 3. Registrar en contabilidad local
    const refPago = referencia || `MANUAL-${Date.now()}`;
    await query(
      `INSERT INTO transacciones_contables (tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, tercero_nombre, notas)
       VALUES ('ingreso', 'Pago Manual Clase', $1, $2, $3, $4, $5, $6, $7)`,
      [`${clase_nombre || 'Clase'} - ${alumno_nombre}`, monto, fechaPago, metodo_pago, refPago, alumno_nombre, notas]
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
