import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanDatabase() {
  console.log('\n⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos');
  console.log('Solo se mantendrá el usuario administrador por defecto\n');
  
  rl.question('¿Estás seguro de que deseas continuar? (escribe "SI" para confirmar): ', async (answer) => {
    if (answer.toUpperCase() !== 'SI') {
      console.log('❌ Operación cancelada');
      rl.close();
      process.exit(0);
    }

    try {
      console.log('\n🔄 Limpiando base de datos...');
      
      const client = await pool.connect();
      
      // Leer el archivo SQL
      const sqlFile = path.join(__dirname, 'src', 'config', 'clean-database.sql');
      const sql = fs.readFileSync(sqlFile, 'utf8');
      
      // Ejecutar la limpieza
      await client.query(sql);
      
      console.log('✅ Base de datos limpiada exitosamente');
      console.log('📋 Datos eliminados:');
      console.log('   - Transacciones contables');
      console.log('   - Pagos');
      console.log('   - Asistencias');
      console.log('   - Inscripciones');
      console.log('   - Clases');
      console.log('   - Profesores');
      console.log('   - Estudiantes');
      console.log('   - Representantes legales');
      console.log('   - Usuarios');
      console.log('\n✅ Usuario admin recreado:');
      console.log('   📧 Email: admin@levelup.com');
      console.log('   🔑 Password: admin123');
      
      client.release();
      rl.close();
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error al limpiar la base de datos:', error.message);
      console.error('Detalles:', error);
      rl.close();
      process.exit(1);
    }
  });
}

cleanDatabase();
