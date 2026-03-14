import { query } from '../config/database.js';

export const getClases = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, p.nombre || ' ' || p.apellido as profesor_nombre
      FROM clases c
      LEFT JOIN profesores p ON c.profesor_id = p.id
      WHERE c.activo = true
      ORDER BY c.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clases' });
  }
};

export const createClase = async (req, res) => {
  try {
    const { nombre, descripcion, profesor_id, precio, frecuencia_semanal, capacidad_maxima, horarios } = req.body;
    const horariosData = horarios && horarios.length > 0 ? horarios : [];
    
    const result = await query(
      `INSERT INTO clases (nombre, descripcion, profesor_id, precio, frecuencia_semanal, capacidad_maxima, horarios)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, descripcion, profesor_id, precio, frecuencia_semanal || 1, capacidad_maxima, JSON.stringify(horariosData)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear clase:', error);
    res.status(500).json({ error: 'Error al crear clase: ' + error.message });
  }
};

export const updateClase = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id, precio, frecuencia_semanal, capacidad_maxima, horarios } = req.body;

    const result = await query(
      `UPDATE clases SET nombre = $2, descripcion = $3, profesor_id = $4, precio = $5, 
       frecuencia_semanal = $6, capacidad_maxima = $7, horarios = $8, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      [id, nombre, descripcion, profesor_id, precio, frecuencia_semanal || 1, capacidad_maxima, JSON.stringify(horarios)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar clase' });
  }
};

export const deleteClase = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE clases SET activo = false WHERE id = $1', [id]);
    res.json({ message: 'Clase eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar clase' });
  }
};
