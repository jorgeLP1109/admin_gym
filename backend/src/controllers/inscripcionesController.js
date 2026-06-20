import { query } from '../config/database.js';

export const getInscripciones = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, 
        e.nombre || ' ' || e.apellido as estudiante_nombre,
        c.nombre as clase_nombre,
        c.precio,
        c.frecuencia_semanal,
        c.horarios,
        (SELECT MAX(p.fecha_vencimiento) FROM pagos p WHERE p.inscripcion_id = i.id) as ultima_fecha_vencimiento
      FROM inscripciones i
      JOIN estudiantes e ON i.estudiante_id = e.id
      JOIN clases c ON i.clase_id = c.id
      WHERE i.activo = true
      ORDER BY e.apellido, e.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

export const getInscripcionesByEstudiante = async (req, res) => {
  try {
    const { estudiante_id } = req.params;
    const result = await query(`
      SELECT i.*, c.nombre as clase_nombre, c.horarios, c.precio,
        (SELECT MAX(p.fecha_vencimiento) FROM pagos p WHERE p.inscripcion_id = i.id) as ultima_fecha_vencimiento
      FROM inscripciones i
      JOIN clases c ON i.clase_id = c.id
      WHERE i.estudiante_id = $1 AND i.activo = true
    `, [estudiante_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

export const createInscripcion = async (req, res) => {
  try {
    const { estudiante_id, clase_id, modalidad_pago, dia_pago, dia_pago_secundario } = req.body;
    
    // Usar modalidad compatible con el constraint de la BD
    const modalidad = modalidad_pago || 'mensual';
    
    const result = await query(
      `INSERT INTO inscripciones (estudiante_id, clase_id, modalidad_pago, dia_pago, dia_pago_secundario)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [estudiante_id, clase_id, modalidad, dia_pago || 1, dia_pago_secundario || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inscripcion:', error.message, error.detail);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta clase' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'El estudiante o la clase no existen' });
    }
    if (error.code === '23514') {
      return res.status(400).json({ error: 'Modalidad de pago no válida. Use: mensual, quincenal o diario' });
    }
    res.status(500).json({ error: 'Error al crear inscripción: ' + error.message });
  }
};

export const deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE inscripciones SET activo = false WHERE id = $1', [id]);
    res.json({ message: 'Inscripción eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar inscripción' });
  }
};
