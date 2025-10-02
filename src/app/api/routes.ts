import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongo";
import Event from "@/models/event";


export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const event = await Event.findById(params.id).lean();
  return NextResponse.json(event);
}
