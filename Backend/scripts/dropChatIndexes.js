// Script to drop the problematic unique index on rentalRequest
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dropIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('chats');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

    // Drop the problematic rentalRequest_1 index
    try {
      await collection.dropIndex('rentalRequest_1');
      console.log('\n✓ Successfully dropped rentalRequest_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('\n✓ Index rentalRequest_1 does not exist (already dropped)');
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    const remainingIndexes = await collection.indexes();
    console.log('\nRemaining indexes:');
    remainingIndexes.forEach(index => {
      console.log(`- ${index.name}`);
    });

    console.log('\n✓ Index cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndexes();
