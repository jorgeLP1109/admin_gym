import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateAdminPassword() {
  try {
    console.log('🔐 Actualizando contraseña del admin...');
    
    const client = await pool.connect();
    
    // Generar hash correcto para "admin123"
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Hash generado:', hashedPassword);
    
    // Actualizar usuario
    await client.query(
      'UPDATE usuarios SET password = $1 WHERE email = $2',
      [hashedPassword, 'admin@levelup.com']
    );
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('📧 Email: admin@levelup.com');
    console.log('🔑 Password: admin123');
    
    client.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();
