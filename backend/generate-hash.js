import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

console.log('Hash generado:', hash);
console.log('\nEjecuta este SQL en Supabase:');
console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'admin@levelup.com';`);
