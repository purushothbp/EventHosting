import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

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

const EventSchema: Schema<IEvent> = new Schema({
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
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  minTeamSize: { type: Number, default: 1 },
  maxTeamSize: { type: Number, default: 1 },
}, { timestamps: true });

export default models.Event || model<IEvent>('Event', EventSchema);
