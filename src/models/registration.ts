import { Schema, models, model, Document, Types } from 'mongoose';

export interface IRegistration extends Document {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  user: Types.ObjectId;
  teamSize: number;
  status: 'registered' | 'waitlisted' | 'cancelled';
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
  }
}, { timestamps: true });

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default models.Registration || model<IRegistration>('Registration', RegistrationSchema);
