-- Eliminar constraint anterior y crear uno nuevo que acepte 'mensual', 'quincenal', 'diario'
ALTER TABLE inscripciones DROP CONSTRAINT IF EXISTS inscripciones_modalidad_pago_check;
ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_modalidad_pago_check 
  CHECK (modalidad_pago IN ('mensual', 'quincenal', 'diario'));

-- Actualizar registros existentes que tengan valores antiguos
UPDATE inscripciones SET modalidad_pago = 'mensual' WHERE modalidad_pago NOT IN ('mensual', 'quincenal', 'diario');
