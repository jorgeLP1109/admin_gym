-- LEVEL UP S&A CENTER - Database Schema

-- Tabla de usuarios (administradores)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'admin',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de representantes legales
CREATE TABLE representantes_legales (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(150) NOT NULL,
  identificacion VARCHAR(50) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estudiantes
CREATE TABLE estudiantes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  identificacion VARCHAR(50) UNIQUE NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  es_menor_edad BOOLEAN DEFAULT false,
  representante_id INTEGER REFERENCES representantes_legales(id),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  genero VARCHAR(20),
  foto_url TEXT,
  
  -- Ficha médica
  tipo_sangre VARCHAR(10),
  alergias TEXT,
  condiciones_medicas TEXT,
  medicamentos_actuales TEXT,
  contacto_emergencia_nombre VARCHAR(100),
  contacto_emergencia_telefono VARCHAR(20),
  
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de profesores
CREATE TABLE profesores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  identificacion VARCHAR(50) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  especialidad VARCHAR(100),
  fecha_contratacion DATE,
  salario DECIMAL(10,2),
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clases
CREATE TABLE clases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  profesor_id INTEGER REFERENCES profesores(id),
  precio_mensual DECIMAL(10,2) NOT NULL,
  precio_quincenal DECIMAL(10,2) NOT NULL,
  capacidad_maxima INTEGER,
  
  -- Horarios (JSON array: [{"dia": "Lunes", "hora_inicio": "08:00", "hora_fin": "09:00"}])
  horarios JSONB NOT NULL,
  
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones
CREATE TABLE inscripciones (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
  clase_id INTEGER REFERENCES clases(id) ON DELETE CASCADE,
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  modalidad_pago VARCHAR(20) NOT NULL CHECK (modalidad_pago IN ('mensual', 'quincenal')),
  dia_pago INTEGER NOT NULL CHECK (dia_pago >= 1 AND dia_pago <= 31),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(estudiante_id, clase_id)
);

-- Tabla de pagos
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  inscripcion_id INTEGER REFERENCES inscripciones(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  metodo_pago VARCHAR(50),
  referencia VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de transacciones contables
CREATE TABLE transacciones_contables (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  categoria VARCHAR(50) NOT NULL,
  concepto TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo_pago VARCHAR(50),
  referencia VARCHAR(100),
  pago_id INTEGER REFERENCES pagos(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_estudiantes_activo ON estudiantes(activo);
CREATE INDEX idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX idx_inscripciones_clase ON inscripciones(clase_id);
CREATE INDEX idx_pagos_inscripcion ON pagos(inscripcion_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX idx_transacciones_fecha ON transacciones_contables(fecha);
CREATE INDEX idx_transacciones_tipo ON transacciones_contables(tipo);

-- Usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@levelup.com', '$2a$10$8K1p/a0dL3.I1/YsGlMinOPSPVICYUUDVnmkr/D2XnWv9xCjGaS9e', 'admin');
