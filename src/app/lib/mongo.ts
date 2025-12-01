// src/lib/mongo.ts
import mongoose from 'mongoose';

// Import all models to ensure they're registered before any database operations
import '@/models';

const MONGODB_URI = process.env.MONGODB_URI as string || 'mongodb+srv://purush:Padhu8697@cluster0.taoh2ot.mongodb.net/eventhosting';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: CachedMongoose;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return { conn: cached.conn, promise: cached.promise };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      console.log('Connecting to MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts);
      await cached.promise;
      console.log('MongoDB connected successfully');
      
      // Verify models are registered
      const models = ['User', 'Event', 'Organization', 'BlogPost', 'BlogComment'];
      models.forEach(model => {
        if (!mongoose.models[model]) {
          console.error(`⚠️ ${model} model is not registered`);
        } else {
          console.log(`✅ ${model} model is registered`);
        }
      });
      
    } catch (e) {
      console.error('MongoDB connection error:', e);
      cached.promise = null;
      throw e;
    }
  }

  try {
    cached.conn = await cached.promise;
    return { conn: cached.conn, promise: cached.promise };
  } catch (e) {
    console.error('MongoDB connection error:', e);
    cached.promise = null;
    throw e;
  }
}
