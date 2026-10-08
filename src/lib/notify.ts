import "server-only";
import { run } from "./db";

/** Record a notification for `userId`, skipping self-notifications. */
export function notify(opts: { userId: number; actorId: number; type: string; message: string; recipeId?: number }) {
  if (opts.userId === opts.actorId) return;
  run("INSERT INTO notifications (user_id, actor_id, recipe_id, type, message) VALUES (?, ?, ?, ?, ?)", [
    opts.userId,
    opts.actorId,
    opts.recipeId ?? null,
    opts.type,
    opts.message,
  ]);
}
