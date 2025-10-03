const { MongoClient } = require('mongodb');

// Connection string from your .env file
const uri = "mongodb+srv://purush:Purush1605@cluster0.taoh2ot.mongodb.net/eventhosting?retryWrites=true&w=majority";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access
    const db = client.db('eventhosting');
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in database:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('bad auth')) {
      console.log('💡 This appears to be an authentication issue. Please check your username and password.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 This appears to be a DNS/network issue. Please check your connection string.');
    }
  } finally {
    await client.close();
  }
}

testConnection();
