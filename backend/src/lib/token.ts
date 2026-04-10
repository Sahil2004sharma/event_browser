import jwt from "jsonwebtoken";
import { env } from "./env";

type LocalAuthPayload = {
  sub: string;
  email: string;
  name: string;
};

export function signLocalAuthToken(payload: LocalAuthPayload) {
  return jwt.sign(payload, env.AUTH_JWT_SECRET, { expiresIn: "7d" });
}

export function verifyLocalAuthToken(token: string) {
  return jwt.verify(token, env.AUTH_JWT_SECRET) as LocalAuthPayload;
}
