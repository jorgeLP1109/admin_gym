-- Agregar precio diario a clases
ALTER TABLE clases ADD COLUMN IF NOT EXISTS precio_diario DECIMAL(10,2);

-- Crear tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
  clase_id INTEGER REFERENCES clases(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  presente BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(estudiante_id, clase_id, fecha)
);

-- Índices para asistencias
CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante ON asistencias(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_clase ON asistencias(clase_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
