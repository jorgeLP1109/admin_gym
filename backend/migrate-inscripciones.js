import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración de inscripciones...');
    
    const client = await pool.connect();
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'src', 'config', 'update-inscripciones.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar la migración
    await client.query(sql);
    
    console.log('✅ Migración completada exitosamente');
    console.log('📋 Cambios aplicados:');
    console.log('   - Campo dia_pago_secundario agregado');
    console.log('   - Modalidad "diario" habilitada');
    
    client.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

runMigration();
