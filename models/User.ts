import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'github';
  plan: 'free' | 'pro';
  copilotAnswersUsed: number;
  mockInterviewsUsed: number;
  resume?: {
    name: string;
    skills: string[];
    experience: string[];
    targetRoles: string[];
    rawText: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    provider: { type: String, enum: ['google', 'github'], required: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    copilotAnswersUsed: { type: Number, default: 0 },
    mockInterviewsUsed: { type: Number, default: 0 },
    resume: {
      name: String,
      skills: [String],
      experience: [String],
      targetRoles: [String],
      rawText: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
