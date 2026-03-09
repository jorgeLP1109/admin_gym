import { query } from '../config/database.js';

export const getTransacciones = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo } = req.query;
    
    let sql = `
      SELECT t.*, 
        CASE 
          WHEN t.pago_id IS NOT NULL THEN 
            e.nombre || ' ' || e.apellido
          ELSE NULL
        END as estudiante_nombre,
        CASE 
          WHEN t.pago_id IS NOT NULL THEN e.identificacion
          ELSE NULL
        END as estudiante_identificacion,
        CASE 
          WHEN t.pago_id IS NOT NULL THEN e.telefono
          ELSE NULL
        END as estudiante_telefono,
        CASE 
          WHEN t.pago_id IS NOT NULL THEN e.direccion
          ELSE NULL
        END as estudiante_direccion
      FROM transacciones_contables t
      LEFT JOIN pagos p ON t.pago_id = p.id
      LEFT JOIN inscripciones i ON p.inscripcion_id = i.id
      LEFT JOIN estudiantes e ON i.estudiante_id = e.id
      WHERE 1=1
    `;
    const params = [];
    
    if (fecha_inicio) {
      params.push(fecha_inicio);
      sql += ` AND t.fecha >= $${params.length}`;
    }
    
    if (fecha_fin) {
      params.push(fecha_fin);
      sql += ` AND t.fecha <= $${params.length}`;
    }
    
    if (tipo) {
      params.push(tipo);
      sql += ` AND t.tipo = $${params.length}`;
    }
    
    sql += ' ORDER BY t.fecha DESC, t.created_at DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

export const createTransaccion = async (req, res) => {
  try {
    const { tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, notas, tercero_nombre, tercero_identificacion, tercero_telefono, tercero_direccion } = req.body;
    
    const result = await query(
      `INSERT INTO transacciones_contables (tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, notas, tercero_nombre, tercero_identificacion, tercero_telefono, tercero_direccion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, notas, tercero_nombre, tercero_identificacion, tercero_telefono, tercero_direccion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear transacción' });
  }
};

export const getResumenContable = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const params = [];
    let whereClause = '';
    
    if (fecha_inicio && fecha_fin) {
      params.push(fecha_inicio, fecha_fin);
      whereClause = 'WHERE fecha BETWEEN $1 AND $2';
    }
    
    const result = await query(`
      SELECT 
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
        SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance
      FROM transacciones_contables
      ${whereClause}
    `, params);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen contable' });
  }
};

export const deleteTransaccion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no esté vinculada a un pago
    const check = await query('SELECT pago_id FROM transacciones_contables WHERE id = $1', [id]);
    if (check.rows[0]?.pago_id) {
      return res.status(400).json({ error: 'No se puede eliminar una transacción vinculada a un pago' });
    }
    
    await query('DELETE FROM transacciones_contables WHERE id = $1', [id]);
    res.json({ message: 'Transacción eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
};
