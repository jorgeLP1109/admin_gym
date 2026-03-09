import { query } from '../config/database.js';

export const getPagos = async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, 
        e.nombre || ' ' || e.apellido as estudiante_nombre,
        c.nombre as clase_nombre,
        i.modalidad_pago
      FROM pagos p
      JOIN inscripciones i ON p.inscripcion_id = i.id
      JOIN estudiantes e ON i.estudiante_id = e.id
      JOIN clases c ON i.clase_id = c.id
      ORDER BY p.fecha_pago DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

export const getPagosByEstudiante = async (req, res) => {
  try {
    const { estudiante_id } = req.params;
    const result = await query(`
      SELECT p.*, c.nombre as clase_nombre, i.modalidad_pago
      FROM pagos p
      JOIN inscripciones i ON p.inscripcion_id = i.id
      JOIN clases c ON i.clase_id = c.id
      WHERE i.estudiante_id = $1
      ORDER BY p.fecha_pago DESC
    `, [estudiante_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

export const createPago = async (req, res) => {
  try {
    const { inscripcion_id, monto, fecha_pago, fecha_vencimiento, metodo_pago, referencia, notas } = req.body;
    
    const result = await query(
      `INSERT INTO pagos (inscripcion_id, monto, fecha_pago, fecha_vencimiento, metodo_pago, referencia, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [inscripcion_id, monto, fecha_pago, fecha_vencimiento, metodo_pago, referencia, notas]
    );

    // Registrar en contabilidad
    await query(
      `INSERT INTO transacciones_contables (tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, pago_id)
       VALUES ('ingreso', 'Mensualidad', 'Pago de clase', $1, $2, $3, $4, $5)`,
      [monto, fecha_pago, metodo_pago, referencia, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar pago' });
  }
};

export const getEstudiantesSolventes = async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT e.id, e.nombre, e.apellido, e.telefono
      FROM estudiantes e
      JOIN inscripciones i ON e.id = i.estudiante_id
      JOIN pagos p ON i.id = p.inscripcion_id
      WHERE i.activo = true 
        AND p.fecha_vencimiento >= CURRENT_DATE
        AND e.activo = true
      ORDER BY e.apellido, e.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes solventes' });
  }
};

export const getEstudiantesMorosos = async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT e.id, e.nombre, e.apellido, e.telefono,
        MAX(p.fecha_vencimiento) as ultima_fecha_vencimiento,
        CURRENT_DATE - MAX(p.fecha_vencimiento) as dias_mora
      FROM estudiantes e
      JOIN inscripciones i ON e.id = i.estudiante_id
      LEFT JOIN pagos p ON i.id = p.inscripcion_id
      WHERE i.activo = true 
        AND e.activo = true
        AND (p.fecha_vencimiento < CURRENT_DATE OR p.id IS NULL)
      GROUP BY e.id, e.nombre, e.apellido, e.telefono
      ORDER BY dias_mora DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes morosos' });
  }
};
