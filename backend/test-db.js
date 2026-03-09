import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...');
    console.log('Connection String:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    
    // Probar conexión
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos!');
    
    // Verificar si existe la tabla usuarios
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuarios'
      );
    `);
    console.log('✅ Tabla usuarios existe:', tableCheck.rows[0].exists);
    
    // Contar usuarios
    const countResult = await client.query('SELECT COUNT(*) FROM usuarios');
    console.log('📊 Total de usuarios en la BD:', countResult.rows[0].count);
    
    // Buscar el usuario admin
    const userResult = await client.query(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = $1',
      ['admin@levelup.com']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✅ Usuario admin encontrado:');
      console.log(userResult.rows[0]);
    } else {
      console.log('❌ Usuario admin NO encontrado en la base de datos');
      console.log('📝 Creando usuario admin...');
      
      await client.query(`
        INSERT INTO usuarios (nombre, email, password, rol) 
        VALUES ('Administrador', 'admin@levelup.com', '$2a$10$8K1p/a0dL3.I1/YsGlMinOPSPVICYUUDVnmkr/D2XnWv9xCjGaS9e', 'admin')
      `);
      
      console.log('✅ Usuario admin creado exitosamente');
    }
    
    client.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

testConnection();
