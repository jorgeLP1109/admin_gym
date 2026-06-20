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

async function run() {
  try {
    console.log('🔄 Actualizando constraint modalidad_pago...');
    const sql = fs.readFileSync(path.join(__dirname, 'src', 'config', 'update-modalidad.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('✅ Constraint actualizado: mensual, quincenal, diario');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message, error.detail || '', error.hint || '');
    process.exit(1);
  }
}

run();
