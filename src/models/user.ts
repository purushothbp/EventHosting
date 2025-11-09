import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  clerkId?: string; // Optional for email/password users
  email: string;
  name: string;
  password?: string; // Optional for OAuth users
  avatarUrl?: string;
  organization?: Types.ObjectId | string; // Can be ObjectId or string
  department?: string;
  year?: number;
  interests?: string[];
  role: 'user' | 'coordinator' | 'admin' | 'super-admin';
  phone?: string;
  location?: string;
  website?: string;
  bio?: string;
  resumeUrl?: string;
  availableForHire?: boolean;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description?: string;
    gpa?: string;
  }>;
  experience?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    location?: string;
  }>;
  skills?: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: 'technical' | 'soft' | 'language' | 'tool';
  }>;
  socialProfiles?: Array<{
    platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'medium' | 'other';
    url: string;
    username?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  clerkId: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows null values for email/password users
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  password: { 
    type: String, 
    select: false // Don't return password by default
  },
  avatarUrl: { 
    type: String 
  },
  organization: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization' 
  },
  department: { 
    type: String 
  },
  year: { 
    type: Number 
  },
  interests: [{ 
    type: String 
  }],
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'coordinator', 'admin', 'super-admin'],
  },
  phone: { type: String },
  location: { type: String },
  website: { type: String },
  bio: { type: String },
  resumeUrl: { type: String },
  availableForHire: { type: Boolean, default: false },
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    description: { type: String },
    gpa: { type: String }
  }],
  experience: [{
    position: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String },
    location: { type: String }
  }],
  skills: [{
    name: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool'],
      required: true
    }
  }],
  socialProfiles: [{
    platform: {
      type: String,
      enum: ['linkedin', 'github', 'twitter', 'portfolio', 'medium', 'other'],
      required: true
    },
    url: { type: String, required: true },
    username: { type: String }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
    credentialUrl: { type: String }
  }],
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password; // Never return password in JSON responses
      return ret;
    }
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Pre-save hook to hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error as Error);
  }
});

export default models.User || model<IUser>('User', UserSchema);
