// Script para testar conexão com banco de dados

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida');
  process.exit(1);
}

console.log('🔗 Testando conexão com banco de dados...');
console.log('URL:', process.env.DATABASE_URL.substring(0, 30) + '...');

let pool;

if (!process.env.REPL_ID && process.env.NODE_ENV === 'development') {
  console.log('🔧 Configurando para desenvolvimento local (driver nativo PostgreSQL)');
  const { Pool } = await import('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  console.log('☁️ Configurando para produção/Replit (Neon serverless)');
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const ws = await import('ws');
  
  neonConfig.webSocketConstructor = ws.default;
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineConnect = false;
  
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida');
  process.exit(1);
}

console.log('🔗 Testando conexão com banco de dados...');
console.log('URL:', process.env.DATABASE_URL.substring(0, 30) + '...');

try {
  const result = await pool.query('SELECT NOW() as current_time, version() as version');
  console.log('✅ Conexão bem-sucedida!');
  console.log('Horário do banco:', result.rows[0].current_time);
  console.log('Versão:', result.rows[0].version.split(' ')[0]);
  
  // Test users table
  const userTest = await pool.query('SELECT COUNT(*) as user_count FROM users');
  console.log('👥 Usuários na tabela:', userTest.rows[0].user_count);
  
} catch (error) {
  console.error('❌ Erro na conexão:', error.message);
  if (error.message.includes('ECONNREFUSED')) {
    console.log('\n💡 Dicas para resolver:');
    console.log('1. Verifique se a DATABASE_URL está correta');
    console.log('2. Se usando PostgreSQL local, verifique se está rodando');
    console.log('3. Para Neon, verifique se o banco não está em sleep');
  }
} finally {
  await pool.end();
}