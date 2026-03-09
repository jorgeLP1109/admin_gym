-- Agregar campo para segundo día de pago quincenal si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='inscripciones' AND column_name='dia_pago_secundario') THEN
        ALTER TABLE inscripciones ADD COLUMN dia_pago_secundario INTEGER;
    END IF;
END $$;

-- Agregar constraint para dia_pago_secundario
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inscripciones_dia_pago_secundario_check') THEN
        ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_dia_pago_secundario_check 
        CHECK (dia_pago_secundario IS NULL OR (dia_pago_secundario >= 1 AND dia_pago_secundario <= 31));
    END IF;
END $$;

-- Actualizar constraint de modalidad_pago para incluir 'diario'
ALTER TABLE inscripciones DROP CONSTRAINT IF EXISTS inscripciones_modalidad_pago_check;
ALTER TABLE inscripciones ADD CONSTRAINT inscripciones_modalidad_pago_check 
CHECK (modalidad_pago IN ('mensual', 'quincenal', 'diario'));
