-- Migración: Cambiar modalidad de precios a frecuencia semanal

-- 1. Agregar nuevas columnas a clases
ALTER TABLE clases ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2);
ALTER TABLE clases ADD COLUMN IF NOT EXISTS frecuencia_semanal INTEGER DEFAULT 1;

-- 2. Migrar datos existentes (usar precio_mensual como precio base)
UPDATE clases SET precio = precio_mensual WHERE precio IS NULL;
UPDATE clases SET frecuencia_semanal = 1 WHERE frecuencia_semanal IS NULL;

-- 3. Hacer precio NOT NULL
ALTER TABLE clases ALTER COLUMN precio SET NOT NULL;

-- 4. Eliminar columnas viejas
ALTER TABLE clases DROP COLUMN IF EXISTS precio_mensual;
ALTER TABLE clases DROP COLUMN IF EXISTS precio_quincenal;
ALTER TABLE clases DROP COLUMN IF EXISTS precio_diario;

-- 5. Actualizar constraint de modalidad_pago en inscripciones
ALTER TABLE inscripciones DROP CONSTRAINT IF EXISTS inscripciones_modalidad_pago_check;
ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_modalidad_pago_check 
  CHECK (modalidad_pago IN ('1_vez_semana', '2_veces_semana', '3_veces_semana'));

-- 6. Migrar modalidades existentes
UPDATE inscripciones SET modalidad_pago = '1_vez_semana' WHERE modalidad_pago = 'mensual';
UPDATE inscripciones SET modalidad_pago = '2_veces_semana' WHERE modalidad_pago = 'quincenal';
UPDATE inscripciones SET modalidad_pago = '1_vez_semana' WHERE modalidad_pago = 'diario';
