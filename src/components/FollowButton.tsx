"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { toggleFollow } from "@/actions/account";

export function FollowButton({ userId, initial, signedIn }: { userId: number; initial: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [following, setFollowing] = useOptimistic(initial);

  return (
    <button
      type="button"
      aria-pressed={following}
      className={following ? "btn-secondary" : "btn-primary"}
      onClick={() => {
        if (!signedIn) {
          router.push(`/login?next=/profile/${userId}`);
          return;
        }
        startTransition(async () => {
          setFollowing(!following);
          await toggleFollow(userId);
        });
      }}
    >
      {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
