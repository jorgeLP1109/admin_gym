import { query } from '../config/database.js';

export const getProfesores = async (req, res) => {
  try {
    const result = await query('SELECT * FROM profesores WHERE activo = true ORDER BY apellido, nombre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
};

export const createProfesor = async (req, res) => {
  try {
    const { nombre, apellido, identificacion, telefono, email, especialidad, fecha_contratacion, salario } = req.body;
    
    const result = await query(
      `INSERT INTO profesores (nombre, apellido, identificacion, telefono, email, especialidad, fecha_contratacion, salario)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, apellido, identificacion, telefono, email, especialidad, fecha_contratacion, salario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear profesor' });
  }
};

export const updateProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const setClause = Object.keys(fields).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(fields)];

    const result = await query(
      `UPDATE profesores SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar profesor' });
  }
};

export const deleteProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE profesores SET activo = false WHERE id = $1', [id]);
    res.json({ message: 'Profesor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar profesor' });
  }
};
