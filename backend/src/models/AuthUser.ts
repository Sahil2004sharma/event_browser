import { Schema, model } from "mongoose";

type AuthUserDoc = {
  email: string;
  name: string;
  passwordHash: string;
};

const authUserSchema = new Schema<AuthUserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const AuthUser = model<AuthUserDoc>("AuthUser", authUserSchema);
