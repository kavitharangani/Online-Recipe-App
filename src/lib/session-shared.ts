export const SESSION_COOKIE = "flavorly_session";

export type SessionPayload = {
  userId: number;
  role: "user" | "admin";
};
