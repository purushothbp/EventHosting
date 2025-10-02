import mongoose from 'mongoose';
import EventModel from '../models/event';
import UserModel from '../models/user';
import OrganizationModel from '../models/Organization';

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

    const hariharan = users.find((u: any) => u.email === "hariharan@gmail.com")!;
    const purush = users.find((u: any) => u.email === "purush1605@gmail.com")!;
    const jane = users.find((u: any) => u.email === "jane.smith@example.com")!;

    // 2️⃣ Insert Organizations
    const organizations = await (Organization as any).insertMany([
      {
        name: "Tech Society",
        tagline: "Innovating the Future",
        logoUrl: "https://dummy.s3.amazonaws.com/logos/techsociety.png",
        watermarkUrl: "https://dummy.s3.amazonaws.com/watermarks/techsociety_wm.png",
        departmentLogos: [
          {
            departmentName: "CSE",
            logoUrl: "https://dummy.s3.amazonaws.com/logos/cse.png",
          },
          {
            departmentName: "ECE",
            logoUrl: "https://dummy.s3.amazonaws.com/logos/ece.png",
          },
        ],
        admins: [hariharan._id],
        coordinators: [jane._id],
      },
      {
        name: "Cultural Club",
        tagline: "Where Culture Comes Alive",
        logoUrl: "https://dummy.s3.amazonaws.com/logos/culturalclub.png",
        watermarkUrl: "https://dummy.s3.amazonaws.com/watermarks/culturalclub_wm.png",
        departmentLogos: [
          {
            departmentName: "Arts",
            logoUrl: "https://dummy.s3.amazonaws.com/logos/arts.png",
          },
          {
            departmentName: "Drama",
            logoUrl: "https://dummy.s3.amazonaws.com/logos/drama.png",
          },
        ],
        admins: [purush._id],
        coordinators: [],
      },
    ]);

    const techSociety = organizations[0];

    // 3️⃣ Insert Events (linked to Tech Society + Hariharan)
    await (Event as any).insertMany([
      {
        title: "AI Workshop",
        date: new Date("2025-10-10"),
        location: "Auditorium Hall A",
        description: "An introductory workshop on Artificial Intelligence basics and applications.",
        imageUrl: "https://dummy.s3.amazonaws.com/images/aiworkshop.png", // use dummy
        isFree: true,
        type: "Workshop",
        organization: techSociety._id,
        department: "CSE",
        organizer: hariharan._id,
        minTeamSize: 1,
        maxTeamSize: 5,
      },
      {
        title: "Cybersecurity Seminar",
        date: new Date("2025-11-05"),
        location: "Main Seminar Room",
        description: "A seminar covering the latest trends in cybersecurity.",
        imageUrl: "https://dummy.s3.amazonaws.com/images/cybersecurity.png",
        isFree: false,
        price: 200,
        type: "Seminar",
        organization: techSociety._id,
        department: "IT",
        organizer: hariharan._id,
        minTeamSize: 1,
        maxTeamSize: 1,
      },
      {
        title: "Cultural Fest 2025",
        date: new Date("2025-12-15"),
        location: "Open Grounds",
        description: "Annual college cultural festival with music, dance, and drama.",
        imageUrl: "https://dummy.s3.amazonaws.com/images/culturalfest.png",
        isFree: true,
        type: "Cultural",
        organization: techSociety._id,
        department: "All",
        organizer: hariharan._id,
        minTeamSize: 1,
        maxTeamSize: 10,
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