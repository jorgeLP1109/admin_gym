import { query } from '../config/database.js';

export const getEstudiantes = async (req, res) => {
  try {
    const result = await query(`
      SELECT e.*, r.nombre_completo as representante_nombre 
      FROM estudiantes e
      LEFT JOIN representantes_legales r ON e.representante_id = r.id
      WHERE e.activo = true
      ORDER BY e.apellido, e.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

export const getEstudianteById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT e.*, 
        r.id as representante_id,
        r.nombre_completo as representante_nombre_completo,
        r.identificacion as representante_identificacion,
        r.telefono as representante_telefono,
        r.email as representante_email,
        r.direccion as representante_direccion
      FROM estudiantes e
      LEFT JOIN representantes_legales r ON e.representante_id = r.id
      WHERE e.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    const estudiante = result.rows[0];
    
    // Estructurar el objeto representante si existe
    if (estudiante.representante_id) {
      estudiante.representante = {
        id: estudiante.representante_id,
        nombre_completo: estudiante.representante_nombre_completo,
        identificacion: estudiante.representante_identificacion,
        telefono: estudiante.representante_telefono,
        email: estudiante.representante_email,
        direccion: estudiante.representante_direccion
      };
    }
    
    res.json(estudiante);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiante' });
  }
};

export const createEstudiante = async (req, res) => {
  try {
    const {
      nombre, apellido, identificacion, fecha_nacimiento, es_menor_edad,
      telefono, email, direccion, genero, tipo_sangre, alergias,
      condiciones_medicas, medicamentos_actuales, contacto_emergencia_nombre,
      contacto_emergencia_telefono, representante
    } = req.body;

    let representante_id = null;

    if (es_menor_edad && representante) {
      const repResult = await query(
        `INSERT INTO representantes_legales (nombre_completo, identificacion, telefono, email, direccion)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [representante.nombre_completo, representante.identificacion, representante.telefono, representante.email, representante.direccion]
      );
      representante_id = repResult.rows[0].id;
    }

    const result = await query(
      `INSERT INTO estudiantes (
        nombre, apellido, identificacion, fecha_nacimiento, es_menor_edad, representante_id,
        telefono, email, direccion, genero, tipo_sangre, alergias, condiciones_medicas,
        medicamentos_actuales, contacto_emergencia_nombre, contacto_emergencia_telefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [nombre, apellido, identificacion, fecha_nacimiento, es_menor_edad, representante_id,
       telefono, email, direccion, genero, tipo_sangre, alergias, condiciones_medicas,
       medicamentos_actuales, contacto_emergencia_nombre, contacto_emergencia_telefono]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear estudiante' });
  }
};

export const updateEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { representante, ...fields } = req.body;
    
    // Filtrar solo campos válidos de la tabla estudiantes
    const validFields = [
      'nombre', 'apellido', 'identificacion', 'fecha_nacimiento', 'es_menor_edad',
      'telefono', 'email', 'direccion', 'genero', 'tipo_sangre', 'alergias',
      'condiciones_medicas', 'medicamentos_actuales', 'contacto_emergencia_nombre',
      'contacto_emergencia_telefono'
    ];
    
    const filteredFields = {};
    validFields.forEach(field => {
      if (fields[field] !== undefined) {
        filteredFields[field] = fields[field];
      }
    });
    
    if (Object.keys(filteredFields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    const setClause = Object.keys(filteredFields).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(filteredFields)];

    const result = await query(
      `UPDATE estudiantes SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'La identificación ya está registrada para otro estudiante' });
    }
    res.status(500).json({ error: 'Error al actualizar estudiante: ' + error.message });
  }
};

export const deleteEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE estudiantes SET activo = false WHERE id = $1', [id]);
    res.json({ message: 'Estudiante eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar estudiante' });
  }
};
