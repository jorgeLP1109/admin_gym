import { query } from '../config/database.js';

export const getAsistencias = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estudiante_id, clase_id } = req.query;
    
    let sql = `
      SELECT a.*, 
        e.nombre || ' ' || e.apellido as estudiante_nombre,
        c.nombre as clase_nombre
      FROM asistencias a
      JOIN estudiantes e ON a.estudiante_id = e.id
      JOIN clases c ON a.clase_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (fecha_inicio) {
      params.push(fecha_inicio);
      sql += ` AND a.fecha >= $${params.length}`;
    }
    
    if (fecha_fin) {
      params.push(fecha_fin);
      sql += ` AND a.fecha <= $${params.length}`;
    }
    
    if (estudiante_id) {
      params.push(estudiante_id);
      sql += ` AND a.estudiante_id = $${params.length}`;
    }
    
    if (clase_id) {
      params.push(clase_id);
      sql += ` AND a.clase_id = $${params.length}`;
    }
    
    sql += ' ORDER BY a.fecha DESC, a.created_at DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

export const createAsistencia = async (req, res) => {
  try {
    const { estudiante_id, clase_id, fecha, presente, notas } = req.body;
    
    const result = await query(
      `INSERT INTO asistencias (estudiante_id, clase_id, fecha, presente, notas)
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (estudiante_id, clase_id, fecha) 
       DO UPDATE SET presente = $4, notas = $5
       RETURNING *`,
      [estudiante_id, clase_id, fecha || new Date().toISOString().split('T')[0], presente !== false, notas]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
};

export const getReporteAsistencias = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    const result = await query(`
      SELECT 
        e.id as estudiante_id,
        e.nombre || ' ' || e.apellido as estudiante_nombre,
        c.nombre as clase_nombre,
        COUNT(a.id) as total_asistencias,
        COUNT(CASE WHEN a.presente THEN 1 END) as asistencias_presentes
      FROM asistencias a
      JOIN estudiantes e ON a.estudiante_id = e.id
      JOIN clases c ON a.clase_id = c.id
      WHERE EXTRACT(MONTH FROM a.fecha) = $1 
        AND EXTRACT(YEAR FROM a.fecha) = $2
      GROUP BY e.id, e.nombre, e.apellido, c.nombre
      ORDER BY e.apellido, e.nombre
    `, [mes, anio]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};
