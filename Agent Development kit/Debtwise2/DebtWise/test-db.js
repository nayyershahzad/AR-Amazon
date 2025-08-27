const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), version(), now()`;
    console.log('📊 Database info:', result[0]);
    
    // Test if we can query users table
    const userCount = await prisma.user.count();
    console.log('👥 User count:', userCount);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if your Neon database is paused/sleeping');
      console.log('2. Verify the connection string is correct');
      console.log('3. Check if your IP is whitelisted (if applicable)');
      console.log('4. Try connecting directly with psql to test');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();