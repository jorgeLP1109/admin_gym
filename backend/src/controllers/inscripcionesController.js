import { query } from '../config/database.js';

export const getInscripciones = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, 
        e.nombre || ' ' || e.apellido as estudiante_nombre,
        c.nombre as clase_nombre,
        c.precio_mensual,
        c.precio_quincenal
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
      SELECT i.*, c.nombre as clase_nombre, c.horarios
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
    
    const result = await query(
      `INSERT INTO inscripciones (estudiante_id, clase_id, modalidad_pago, dia_pago, dia_pago_secundario)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [estudiante_id, clase_id, modalidad_pago, dia_pago, dia_pago_secundario || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta clase' });
    }
    res.status(500).json({ error: 'Error al crear inscripción' });
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
