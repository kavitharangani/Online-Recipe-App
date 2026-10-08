"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { get, run } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import type { ActionState, Role } from "@/lib/types";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters.")
  .regex(/[a-zA-Z]/, "At least one letter.")
  .regex(/[0-9]/, "At least one number.");

const RegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name is too long."),
    email: z.email("Please enter a valid email.").trim().toLowerCase(),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { message: "Passwords do not match.", path: ["confirm"] });

const LoginSchema = z.object({
  email: z.email("Please enter a valid email.").trim().toLowerCase(),
  password: z.string().min(1, "Please enter your password."),
});

/** Only allow redirects back into this site. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function register(_state: ActionState, formData: FormData): Promise<ActionState> {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { name, email, password } = parsed.data;
  if (get("SELECT id FROM users WHERE email = ?", email)) {
    return { errors: { email: ["An account with this email already exists."] }, values };
  }

  const hash = await bcrypt.hash(password, 10);
  const { id } = run("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, hash]);
  run("INSERT INTO notifications (user_id, type, message) VALUES (?, 'welcome', ?)", [
    id,
    `Welcome to Flavorly, ${name.split(" ")[0]}! Share your first recipe or start planning your week.`,
  ]);

  await createSession(id, "user");
  redirect(safeNext(formData.get("next")));
}

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const user = get<{ id: number; password_hash: string; role: Role }>(
    "SELECT id, password_hash, role FROM users WHERE email = ?",
    parsed.data.email,
  );
  // Same message for unknown email and wrong password so accounts can't be probed.
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    return { message: "Incorrect email or password.", values };
  }

  await createSession(user.id, user.role);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
