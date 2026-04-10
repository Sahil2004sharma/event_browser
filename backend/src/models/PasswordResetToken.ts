import { Schema, model } from "mongoose";

type PasswordResetTokenDoc = {
  email: string;
  tokenHash: string;
  expiresAt: Date;
};

const passwordResetTokenSchema = new Schema<PasswordResetTokenDoc>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const PasswordResetToken = model<PasswordResetTokenDoc>("PasswordResetToken", passwordResetTokenSchema);
