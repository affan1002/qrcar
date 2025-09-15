// backend/test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

// Instead of importing connectDB, let's do it directly to avoid import issues
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    
    console.log('MongoDB URI found:', process.env.MONGODB_URI.substring(0, 20) + '...');
    
    // Connect directly
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully!');
    
    // Test creating a simple document
    const testCollection = mongoose.connection.db.collection('test');
    const testDoc = { 
      message: 'Test connection successful', 
      timestamp: new Date() 
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('Test document inserted with ID:', result.insertedId);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('Test document cleaned up');
    
    console.log('All database tests passed!');
    
  } catch (error) {
    console.error('Database test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nPossible solutions:');
      console.log('1. Install and start MongoDB locally');
      console.log('2. Or use MongoDB Atlas (cloud) - I can help you set this up');
    }
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  }
}

testDatabase();