"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/dal";
import { all, get, run } from "@/lib/db";
import { notify } from "@/lib/notify";
import { deleteSession } from "@/lib/session";
import { deleteImage, hasFile, saveImage, validateImage } from "@/lib/uploads";
import type { ActionState } from "@/lib/types";

const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name is too long."),
  email: z.email("Please enter a valid email.").trim().toLowerCase(),
  bio: z.string().trim().max(300, "Keep your bio under 300 characters."),
});

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  const { name, email, bio } = parsed.data;

  if (get("SELECT id FROM users WHERE email = ? AND id != ?", [email, user.id])) {
    return { errors: { email: ["That email is already used by another account."] } };
  }

  let avatar = user.avatar;
  const file = formData.get("avatar");
  if (hasFile(file)) {
    const error = validateImage(file);
    if (error) return { errors: { avatar: [error] } };
    avatar = await saveImage(file);
    await deleteImage(user.avatar);
  } else if (formData.get("remove_avatar") === "on") {
    await deleteImage(user.avatar);
    avatar = null;
  }

  run("UPDATE users SET name = ?, email = ?, bio = ?, avatar = ? WHERE id = ?", [name, email, bio, avatar, user.id]);
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

const PasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    password: z
      .string()
      .min(8, "At least 8 characters.")
      .regex(/[a-zA-Z]/, "At least one letter.")
      .regex(/[0-9]/, "At least one number."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { message: "Passwords do not match.", path: ["confirm"] });

async function checkPassword(userId: number, password: string) {
  const row = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", userId);
  return !!row && (await bcrypt.compare(password, row.password_hash));
}

export async function changePassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = PasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  if (!(await checkPassword(user.id, parsed.data.current))) {
    return { errors: { current: ["That's not your current password."] } };
  }
  run("UPDATE users SET password_hash = ? WHERE id = ?", [await bcrypt.hash(parsed.data.password, 10), user.id]);
  return { ok: true, message: "Password updated." };
}

export async function deleteAccount(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!(await checkPassword(user.id, String(formData.get("password") ?? "")))) {
    return { errors: { password: ["Password is incorrect."] } };
  }
  if (user.role === "admin" && get<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'")!.n <= 1) {
    return { message: "You're the only admin. Promote someone else before deleting your account." };
  }
  const images = all<{ image: string | null }>("SELECT image FROM recipes WHERE user_id = ?", user.id);
  run("DELETE FROM users WHERE id = ?", user.id);
  await Promise.all([...images.map((row) => deleteImage(row.image)), deleteImage(user.avatar)]);
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/?goodbye=1");
}

export async function toggleFollow(targetId: number): Promise<{ following: boolean }> {
  const user = await requireUser();
  if (targetId === user.id || !get("SELECT id FROM users WHERE id = ?", targetId)) return { following: false };

  const removed = run("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [user.id, targetId]).changes > 0;
  if (!removed) {
    run("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [user.id, targetId]);
    notify({ userId: targetId, actorId: user.id, type: "follow", message: `${user.name} started following you` });
  }
  revalidatePath("/", "layout");
  return { following: !removed };
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", user.id);
  revalidatePath("/", "layout");
}

export async function clearNotifications() {
  const user = await requireUser();
  run("DELETE FROM notifications WHERE user_id = ?", user.id);
  revalidatePath("/", "layout");
}
