import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Error inesperado en pool de BD:', err.message);
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexión a base de datos exitosa'))
  .catch((err) => console.error('❌ Error conectando a BD:', err.message));

export const query = (text, params) => pool.query(text, params);

export default pool;
