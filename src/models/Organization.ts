import mongoose, { Schema, Document, model, models, Types } from 'mongoose';

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
  admins: Types.ObjectId[]; // List of user IDs
  coordinators: Types.ObjectId[]; // List of user IDs
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  tagline: { type: String },
  logoUrl: { type: String, required: true },
  watermarkUrl: { type: String },
  departmentLogos: [{
    departmentName: String,
    logoUrl: String,
  }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  coordinators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default models.Organization || model<IOrganization>('Organization', OrganizationSchema);
