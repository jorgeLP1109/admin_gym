-- Script para limpiar la base de datos (eliminar todos los datos)
-- ADVERTENCIA: Esto eliminará TODOS los datos de las tablas

-- Eliminar datos en orden inverso a las dependencias
TRUNCATE TABLE transacciones_contables CASCADE;
TRUNCATE TABLE pagos CASCADE;
TRUNCATE TABLE asistencias CASCADE;
TRUNCATE TABLE inscripciones CASCADE;
TRUNCATE TABLE clases CASCADE;
TRUNCATE TABLE profesores CASCADE;
TRUNCATE TABLE estudiantes CASCADE;
TRUNCATE TABLE representantes_legales CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- Reiniciar secuencias (IDs)
ALTER SEQUENCE transacciones_contables_id_seq RESTART WITH 1;
ALTER SEQUENCE pagos_id_seq RESTART WITH 1;
ALTER SEQUENCE asistencias_id_seq RESTART WITH 1;
ALTER SEQUENCE inscripciones_id_seq RESTART WITH 1;
ALTER SEQUENCE clases_id_seq RESTART WITH 1;
ALTER SEQUENCE profesores_id_seq RESTART WITH 1;
ALTER SEQUENCE estudiantes_id_seq RESTART WITH 1;
ALTER SEQUENCE representantes_legales_id_seq RESTART WITH 1;
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;

-- Recrear usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@levelup.com', '$2a$10$8K1p/a0dL3.I1/YsGlMinOPSPVICYUUDVnmkr/D2XnWv9xCjGaS9e', 'admin');
