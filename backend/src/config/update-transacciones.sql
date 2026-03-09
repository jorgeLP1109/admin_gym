-- Agregar campos para terceros en transacciones contables
ALTER TABLE transacciones_contables ADD COLUMN IF NOT EXISTS tercero_nombre VARCHAR(150);
ALTER TABLE transacciones_contables ADD COLUMN IF NOT EXISTS tercero_identificacion VARCHAR(50);
ALTER TABLE transacciones_contables ADD COLUMN IF NOT EXISTS tercero_telefono VARCHAR(20);
ALTER TABLE transacciones_contables ADD COLUMN IF NOT EXISTS tercero_direccion TEXT;
