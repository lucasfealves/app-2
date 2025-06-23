// Script para testar conexão com banco de dados
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

// Configure neon
neonConfig.webSocketConstructor = ws;

// For local development, disable WebSocket
if (!process.env.REPL_ID && process.env.NODE_ENV === 'development') {
  console.log('Configurando para desenvolvimento local (sem WebSocket)');
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineConnect = false;
  neonConfig.pipelineTLS = false;
} else {
  console.log('Configurando para produção/Replit (com WebSocket)');
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineConnect = false;
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida');
  process.exit(1);
}

console.log('🔗 Testando conexão com banco de dados...');
console.log('URL:', process.env.DATABASE_URL.substring(0, 30) + '...');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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