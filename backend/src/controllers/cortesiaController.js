import { query } from '../config/database.js';

export const getCortesias = async (req, res) => {
  try {
    const result = await query(`
      SELECT ec.*, c.nombre as clase_nombre,
        e.nombre || ' ' || e.apellido as estudiante_formal_nombre
      FROM estudiantes_cortesia ec
      LEFT JOIN clases c ON ec.clase_id = c.id
      LEFT JOIN estudiantes e ON ec.estudiante_id = e.id
      ORDER BY ec.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cortesías' });
  }
};

export const createCortesia = async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, clase_id, notas } = req.body;
    const result = await query(
      `INSERT INTO estudiantes_cortesia (nombre, apellido, telefono, email, clase_id, notas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, apellido || '', telefono, email, clase_id, notas]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar cortesía' });
  }
};

// Convertir estudiante de cortesía a estudiante formal
export const convertirAFormal = async (req, res) => {
  try {
    const { id } = req.params;

    const cortesia = await query('SELECT * FROM estudiantes_cortesia WHERE id = $1', [id]);
    if (cortesia.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });

    const ec = cortesia.rows[0];
    if (ec.convertido) return res.status(400).json({ error: 'Ya fue convertido a estudiante formal' });

    // Crear estudiante formal
    const estudiante = await query(
      `INSERT INTO estudiantes (nombre, apellido, telefono, email, identificacion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ec.nombre, ec.apellido, ec.telefono, ec.email, ec.email || `CORTESIA-${id}`]
    );

    // Marcar como convertido
    await query(
      `UPDATE estudiantes_cortesia SET convertido = true, fecha_conversion = CURRENT_DATE, estudiante_id = $1 WHERE id = $2`,
      [estudiante.rows[0].id, id]
    );

    res.json({ message: 'Convertido a estudiante formal', estudiante: estudiante.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un estudiante con ese email/identificación' });
    }
    res.status(500).json({ error: 'Error al convertir: ' + error.message });
  }
};

export const deleteCortesia = async (req, res) => {
  try {
    await query('DELETE FROM estudiantes_cortesia WHERE id = $1', [req.params.id]);
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

// Estadísticas de cortesía
export const getEstadisticas = async (req, res) => {
  try {
    const total = await query('SELECT COUNT(*) as total FROM estudiantes_cortesia');
    const convertidos = await query('SELECT COUNT(*) as total FROM estudiantes_cortesia WHERE convertido = true');

    // Por semana (últimas 4)
    const semanal = await query(`
      SELECT 
        date_trunc('week', fecha_cortesia) as semana,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE convertido = true) as convertidos
      FROM estudiantes_cortesia
      WHERE fecha_cortesia >= CURRENT_DATE - INTERVAL '4 weeks'
      GROUP BY semana ORDER BY semana DESC
    `);

    // Por mes (últimos 6)
    const mensual = await query(`
      SELECT 
        date_trunc('month', fecha_cortesia) as mes,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE convertido = true) as convertidos
      FROM estudiantes_cortesia
      WHERE fecha_cortesia >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY mes ORDER BY mes DESC
    `);

    // Por trimestre (últimos 4)
    const trimestral = await query(`
      SELECT 
        date_trunc('quarter', fecha_cortesia) as trimestre,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE convertido = true) as convertidos
      FROM estudiantes_cortesia
      WHERE fecha_cortesia >= CURRENT_DATE - INTERVAL '1 year'
      GROUP BY trimestre ORDER BY trimestre DESC
    `);

    // Anual
    const anual = await query(`
      SELECT 
        date_trunc('year', fecha_cortesia) as anio,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE convertido = true) as convertidos
      FROM estudiantes_cortesia
      GROUP BY anio ORDER BY anio DESC
    `);

    // Por clase
    const porClase = await query(`
      SELECT c.nombre as clase, COUNT(ec.id) as total,
        COUNT(ec.id) FILTER (WHERE ec.convertido = true) as convertidos
      FROM estudiantes_cortesia ec
      LEFT JOIN clases c ON ec.clase_id = c.id
      GROUP BY c.nombre ORDER BY total DESC
    `);

    res.json({
      resumen: {
        total: parseInt(total.rows[0].total),
        convertidos: parseInt(convertidos.rows[0].total),
        tasa: total.rows[0].total > 0 ? Math.round((convertidos.rows[0].total / total.rows[0].total) * 100) : 0
      },
      semanal: semanal.rows,
      mensual: mensual.rows,
      trimestral: trimestral.rows,
      anual: anual.rows,
      porClase: porClase.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
