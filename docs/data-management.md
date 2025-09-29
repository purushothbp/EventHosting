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

Using an ODM like Mongoose is highly recommended to enforce schema validation. This section defines the structure for the main data models in the application.

1.  **Install Mongoose**: `npm install mongoose`

2.  **Define Schemas**:
    Create files for your models in a new `src/models` directory.

    ---
    
    #### **Event Schema**
    *File: `src/models/Event.ts`*
    
    This schema defines all the details for an event. It links to an `Organization` and a `User` (the organizer).

    ```typescript
    // src/models/Event.ts
    import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

    export interface IEvent extends Document {
      _id: Types.ObjectId;
      title: string;
      date: Date;
      location: string;
      description: string;
      imageUrl: string; // URL from S3
      isFree: boolean;
      price?: number;
      type: 'Workshop' | 'Seminar' | 'Competition' | 'Cultural';
      organization: Types.ObjectId; // Reference to Organization
      department?: string;
      organizer: Types.ObjectId; // Reference to User
      minTeamSize: number;
      maxTeamSize: number;
      createdAt: Date;
      updatedAt: Date;
    }

    const EventSchema: Schema = new Schema({
      title: { type: String, required: true },
      date: { type: Date, required: true },
      location: { type: String, required: true },
      description: { type: String, required: true },
      imageUrl: { type: String, required: true },
      isFree: { type: Boolean, default: false },
      price: { type: Number },
      type: { type: String, required: true, enum: ['Workshop', 'Seminar', 'Competition', 'Cultural'] },
      organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
      department: { type: String },
      organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // The admin/organizer who created it
      minTeamSize: { type: Number, default: 1 },
      maxTeamSize: { type: Number, default: 1 },
    }, { timestamps: true });

    export default models.Event || model<IEvent>('Event', EventSchema);
    ```

    ---

    #### **User Schema**
    *File: `src/models/User.ts`*

    This schema stores information about individual users, including their role (attendee or organizer).

    ```typescript
    // src/models/User.ts
    import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

    export interface IUser extends Document {
      _id: Types.ObjectId;
      clerkId: string; // Or any other auth provider ID
      email: string;
      name: string;
      avatarUrl?: string;
      organization: Types.ObjectId; // Reference to Organization
      department?: string;
      year?: number;
      interests?: string[];
      role: 'user' | 'admin';
      createdAt: Date;
      updatedAt: Date;
    }

    const UserSchema: Schema = new Schema({
      clerkId: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      avatarUrl: { type: String },
      organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
      department: { type: String },
      year: { type: Number },
      interests: [{ type: String }],
      role: { type: String, default: 'user', enum: ['user', 'admin'] }
    }, { timestamps: true });

    export default models.User || model<IUser>('User', UserSchema);
    ```

    ---

    #### **Organization Schema**
    *File: `src/models/Organization.ts`*
    
    This schema holds branding and administrative information for each organization on the platform.

    ```typescript
    // src/models/Organization.ts
    import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

    interface IDepartmentLogo {
      departmentName: string;
      logoUrl: string; // URL from S3
    }
    
    export interface IOrganization extends Document {
      _id: Types.ObjectId;
      name: string;
      tagline?: string;
      logoUrl: string; // URL from S3
      watermarkUrl?: string; // URL from S3
      departmentLogos?: IDepartmentLogo[];
      admins: Types.ObjectId[]; // List of user IDs who are admins for this org
      createdAt: Date;
      updatedAt: Date;
    }

    const OrganizationSchema: Schema = new Schema({
      name: { type: String, required: true },
      tagline: { type: String },
      logoUrl: { type: String, required: true },
      watermarkUrl: { type: String },
      departmentLogos: [{
        departmentName: String,
        logoUrl: String,
      }],
      admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    }, { timestamps: true });

    export default models.Organization || model<IOrganization>('Organization', OrganizationSchema);
    ```

    ---

    #### **Booking Schema**
    *File: `src/models/Booking.ts`*
    
    This schema links a `User` to an `Event` they have registered for, creating a booking record.

    ```typescript
    // src/models/Booking.ts
    import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

    export interface IBooking extends Document {
      _id: Types.ObjectId;
      user: Types.ObjectId; // Reference to User
      event: Types.ObjectId; // Reference to Event
      teamSize: number;
      totalPrice?: number;
      createdAt: Date;
      updatedAt: Date;
    }

    const BookingSchema: Schema = new Schema({
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
      teamSize: { type: Number, required: true, min: 1 },
      totalPrice: { type: Number },
    }, { timestamps: true });

    export default models.Booking || model<IBooking>('Booking', BookingSchema);
    ```

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
    *   `Public URL Endpoint`

3.  **Environment Variables**:
    Add these to your `.env.local` file:
    ```
    S3_ACCESS_KEY_ID=...
    S3_SECRET_ACCESS_KEY=...
    S3_BUCKET_NAME=...
    S3_REGION=ap-south-1
    S3_PUBLIC_URL=https://your-bucket-name.s3.your-region.amazonaws.com
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
    
    // const fileUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
    // Save `fileUrl` to your MongoDB database.
    ```
