import { Schema, models, model, Document, Types } from 'mongoose';

export type AttendanceStatus = 'unmarked' | 'pending_confirmation' | 'confirmed' | 'absent';

export interface IParticipantAttendance {
  status: AttendanceStatus;
  markedBy?: Types.ObjectId;
  markedAt?: Date;
  confirmedBy?: Types.ObjectId;
  confirmedAt?: Date;
  confirmationNotes?: string;
  certificateSentAt?: Date;
}

export interface IRegistrationParticipant {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  isPrimary: boolean;
  attendance?: IParticipantAttendance;
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
      attendance: {
        status: {
          type: String,
          enum: ['unmarked', 'pending_confirmation', 'confirmed', 'absent'],
          default: 'unmarked'
        },
        markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        markedAt: { type: Date },
        confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        confirmedAt: { type: Date },
        confirmationNotes: { type: String, trim: true },
        certificateSentAt: { type: Date },
      }
    },
  ],
}, { timestamps: true });

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default models.Registration || model<IRegistration>('Registration', RegistrationSchema);
