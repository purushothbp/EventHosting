import mongoose from 'mongoose';
import EventModel from '../models/event';
import UserModel from '../models/user';
import OrganizationModel from '../models/organization';

// Use the models directly
const Event = EventModel;
const User = UserModel;
const Organization = OrganizationModel;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to DB");

    // clear old docs
    await Promise.all([
      (User as any).deleteMany({}),
      (Organization as any).deleteMany({}),
      (Event as any).deleteMany({})
    ]);

    // 1️⃣ Insert Users
    const users = await (User as any).insertMany([
      {
        clerkId: "clerk_admin_001",
        email: "hariharan@gmail.com",
        name: "Hariharan",
        role: "admin",
        department: "CSE",
        year: 3,
        interests: ["Tech", "Leadership"],
      },
      {
        clerkId: "clerk_superadmin_001",
        email: "purush1605@gmail.com",
        name: "Purushothaman",
        role: "super-admin",
        department: "ECE",
        year: 4,
        interests: ["Management", "Innovation"],
      },
      {
        clerkId: "clerk_user_001",
        email: "john.doe@example.com",
        name: "John Doe",
        role: "user",
        department: "Mechanical",
        year: 2,
        interests: ["Robotics", "Gaming"],
      },
      {
        clerkId: "clerk_user_002",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        role: "coordinator",
        department: "IT",
        year: 1,
        interests: ["Cultural", "Events"],
      },
    ]);

    console.log("Seed complete ✅");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();