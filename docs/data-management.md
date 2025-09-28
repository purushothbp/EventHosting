# Data & Storage Management Guide

This document provides a technical guide for setting up and managing the application's database with MongoDB and handling file storage with an S3-compatible service.

---

## 1. Database Setup with MongoDB

This application is designed to work with a NoSQL database. While the current version uses placeholder data, here’s how you would connect it to MongoDB.

### a) Connection

1.  **Get Connection URI**:
    First, you need a MongoDB instance. You can get one from MongoDB Atlas (which offers a generous free tier) or another provider. Once set up, you will get a connection string (URI) that looks like this:
    ```
    mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
    ```

2.  **Environment Variables**:
    Store this URI securely in your environment variables. Create a `.env.local` file in the root of your project and add the following:
    ```
    MONGODB_URI=mongodb+srv://...
    DATABASE_NAME=nexus_events
    ```

3.  **Create a Database Client**:
    Create a utility file to manage the database connection at `src/lib/mongodb.ts`:

    ```typescript
    // src/lib/mongodb.ts
    import { Db, MongoClient } from 'mongodb';

    const MONGODB_URI = process.env.MONGODB_URI;
    const DATABASE_NAME = process.env.DATABASE_NAME;

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    if (!DATABASE_NAME) {
        throw new Error('Please define the DATABASE_NAME environment variable inside .env.local');
    }

    // A global variable is used to cache the connection across hot reloads in development.
    let cachedClient: MongoClient | null = null;
    let cachedDb: Db | null = null;

    export async function connectToDatabase() {
      if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
      }

      const client = await MongoClient.connect(MONGODB_URI);
      const db = client.db(DATABASE_NAME);

      cachedClient = client;
      cachedDb = db;

      return { client, db };
    }
    ```

### b) Data Schemas (Mongoose)

Using an ODM like Mongoose is highly recommended to enforce schema validation.

1.  **Install Mongoose**: `npm install mongoose`

2.  **Define Schemas**:
    Create files for your models, for example `src/models/Event.ts`.

    **Event Schema**
    ```typescript
    // src/models/Event.ts
    import mongoose, { Schema, Document, models, model } from 'mongoose';

    export interface IEvent extends Document {
      title: string;
      date: Date;
      location: string;
      organization: string; // Could be a reference to an Organization model
      department?: string;
      type: 'Workshop' | 'Seminar' | 'Competition' | 'Cultural';
      isFree: boolean;
      price?: number;
      description: string;
      organizer: string; // Could be a reference to a User model
      imageUrl: string; // URL from S3
    }

    const EventSchema: Schema = new Schema({
      title: { type: String, required: true },
      date: { type: Date, required: true },
      location: { type: String, required: true },
      organization: { type: String, required: true },
      department: { type: String },
      type: { type: String, required: true, enum: ['Workshop', 'Seminar', 'Competition', 'Cultural'] },
      isFree: { type: Boolean, default: false },
      price: { type: Number },
      description: { type: String, required: true },
      organizer: { type: String, required: true },
      imageUrl: { type: String, required: true },
    });

    export default models.Event || model<IEvent>('Event', EventSchema);
    ```

    You would then create similar schemas for `User`, `Organization`, `Booking`, etc.

---

## 2. File Storage with S3

For storing user-uploaded content like logos, watermarks, and event images, an S3-compatible object storage is ideal.

### a) Setup

1.  **Choose an S3 Provider**:
    You can use AWS S3, or other compatible providers like DigitalOcean Spaces, Cloudflare R2, or self-host with MinIO.

2.  **Get Credentials**:
    You will need the following credentials from your provider:
    *   `Access Key ID`
    *   `Secret Access Key`
    *   `Bucket Name`
    *   `Region` (e.g., `ap-south-1` for Mumbai)

3.  **Environment Variables**:
    Add these to your `.env.local` file:
    ```
    S3_ACCESS_KEY_ID=...
    S3_SECRET_ACCESS_KEY=...
    S3_BUCKET_NAME=...
    S3_REGION=ap-south-1
    ```

### b) Usage (Server-Side)

You'll need to create API endpoints in Next.js (or Server Actions) to handle file uploads securely.

1.  **Install AWS SDK**: `npm install @aws-sdk/client-s3`

2.  **Create an S3 Client**:
    Create a utility file at `src/lib/s3.ts`:
    ```typescript
    // src/lib/s3.ts
    import { S3Client } from '@aws-sdk/client-s3';

    const S3_REGION = process.env.S3_REGION;
    const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
    const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

    if (!S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
        throw new Error("S3 environment variables are not fully configured.");
    }

    const s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    });

    export default s3Client;
    ```

3.  **Uploading Files**:
    On the client, the user selects a file from an `<input type="file" />`. You would then send this file to a server-side API endpoint. The endpoint would use a library like `formidable` to parse the form data and then use the S3 client to upload the file.

    **Example Upload Logic (in an API route)**
    ```typescript
    import { PutObjectCommand } from '@aws-sdk/client-s3';
    import s3Client from '@/lib/s3';
    import { promises as fs } from 'fs';

    // Inside an async API handler function
    // Assume `file` is an object from a form parsing library like { filepath: '...', originalFilename: '...' }

    // const file = ...; // from form parser
    // const fileContent = await fs.readFile(file.filepath);
    // const key = `logos/${Date.now()}_${file.originalFilename}`;

    // const command = new PutObjectCommand({
    //   Bucket: process.env.S3_BUCKET_NAME,
    //   Key: key,
    //   Body: fileContent,
    //   ContentType: file.mimetype,
    // });

    // await s3Client.send(command);
    
    // const fileUrl = `https://<bucket-name>.<region>.digitaloceanspaces.com/${key}`;
    // Save `fileUrl` to your MongoDB database.
    ```
