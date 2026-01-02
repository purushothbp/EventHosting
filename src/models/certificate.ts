import { Schema, model, models, Document, Types } from 'mongoose';

export interface ICertificate extends Document {
  _id: Types.ObjectId;
  certificateId: string;
  participantName: string;
  participantEmail: string;
  eventId: Types.ObjectId;
  eventTitle: string;
  eventDate?: Date;
  organizationId?: Types.ObjectId;
  organizationName?: string;
  issuedAt: Date;
  verificationUrl: string;
  issuedBy?: Types.ObjectId;
  status: 'valid' | 'revoked';
}

const CertificateSchema = new Schema<ICertificate>({
  certificateId: { type: String, required: true, unique: true, index: true },
  participantName: { type: String, required: true },
  participantEmail: { type: String, required: true, lowercase: true, trim: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String },
  issuedAt: { type: Date, default: Date.now },
  verificationUrl: { type: String, required: true },
  issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['valid', 'revoked'], default: 'valid' },
}, { timestamps: true });

CertificateSchema.index({ participantEmail: 1, eventId: 1 });

export default models.Certificate || model<ICertificate>('Certificate', CertificateSchema);
