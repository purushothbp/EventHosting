import { Schema, models, model, Document, Types } from 'mongoose';

export interface IRegistrationParticipant {
  name: string;
  email: string;
  isPrimary: boolean;
}

export interface IRegistration extends Document {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  user: Types.ObjectId;
  teamSize: number;
  status: 'registered' | 'waitlisted' | 'cancelled';
  participants: IRegistrationParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teamSize: { type: Number, default: 1, min: 1 },
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled'],
    default: 'registered'
  },
  participants: [
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      isPrimary: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default models.Registration || model<IRegistration>('Registration', RegistrationSchema);
