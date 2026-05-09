import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion {
  question: string;
  answer: string;
  source: 'mic' | 'chat' | 'caption' | 'manual';
  platform?: 'meet' | 'zoom' | 'teams' | 'other';
  confidence: number;
  timestamp: Date;
  answerStyle: 'concise' | 'star' | 'technical';
}

export interface IInterviewSession extends Document {
  userId: string;
  type: 'live' | 'mock';
  jobRole: string;
  platform?: 'meet' | 'zoom' | 'teams' | 'other';
  questions: IQuestion[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'active' | 'ended';
  resumeUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    source: { type: String, enum: ['mic', 'chat', 'caption', 'manual'], required: true },
    platform: { type: String, enum: ['meet', 'zoom', 'teams', 'other'] },
    confidence: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    answerStyle: { type: String, enum: ['concise', 'star', 'technical'], default: 'concise' },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['live', 'mock'], required: true },
    jobRole: { type: String, required: true },
    platform: { type: String, enum: ['meet', 'zoom', 'teams', 'other'] },
    questions: [QuestionSchema],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    resumeUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession: Model<IInterviewSession> =
  mongoose.models.InterviewSession || mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
