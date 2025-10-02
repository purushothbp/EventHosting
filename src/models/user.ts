import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  clerkId: string; // Or any other auth provider ID
  email: string;
  name: string;
  avatarUrl?: string;
  organization?: Types.ObjectId; // Reference to Organization (optional)
  department?: string;
  year?: number;
  interests?: string[];
  role: 'user' | 'coordinator' | 'admin' | 'super-admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  department: { type: String },
  year: { type: Number },
  interests: [{ type: String }],
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'coordinator', 'admin', 'super-admin'],
  },
}, { timestamps: true });

export default models.User || model<IUser>('User', UserSchema);
