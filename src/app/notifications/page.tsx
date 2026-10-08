import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck, Heart, MessageSquare, Sparkles, Trash2, UserPlus, Utensils } from "lucide-react";
import { clearNotifications, markAllNotificationsRead } from "@/actions/account";
import { requireUser } from "@/lib/dal";
import { timeAgo } from "@/lib/format";
import { getNotifications } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { Container, EmptyState, PageHeader } from "@/components/layout";
import { ConfirmButton, SubmitButton } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = { title: "Notifications" };

const ICONS: Record<string, typeof Bell> = {
  review: MessageSquare,
  favorite: Heart,
  follow: UserPlus,
  new_recipe: Utensils,
  welcome: Sparkles,
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = getNotifications(user.id);
  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        actions={
          notifications.length > 0 && (
            <>
              {unread > 0 && (
                <form action={markAllNotificationsRead}>
                  <SubmitButton className="btn-secondary"><CheckCheck className="size-4" /> Mark all read</SubmitButton>
                </form>
              )}
              <ConfirmButton action={clearNotifications} confirmText="Clear all notifications?" className="btn-ghost">
                <Trash2 className="size-4" /> Clear
              </ConfirmButton>
            </>
          )
        }
      />
      {notifications.length === 0 ? (
        <EmptyState emoji="🔔" title="No notifications" text="When someone reviews, saves your recipes or follows you, you'll see it here." />
      ) : (
        <Stagger as="ul" inView={false} interval={0.05} className="card divide-y divide-stone-100 overflow-hidden dark:divide-stone-800">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            const href = n.recipe_id ? `/recipes/${n.recipe_id}` : n.actor_id ? `/profile/${n.actor_id}` : "/dashboard";
            return (
              <StaggerItem as="li" kind="slide" key={n.id}>
                <Link href={href} className={`flex items-center gap-4 p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/60 ${n.is_read ? "" : "bg-brand-50/60 dark:bg-brand-500/5"}`}>
                  <div className="relative">
                    {n.actor_name ? (
                      <Avatar name={n.actor_name} src={n.actor_avatar} />
                    ) : (
                      <span className="grid size-10 place-items-center rounded-full bg-brand-500 text-white"><Sparkles className="size-5" /></span>
                    )}
                    <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-white shadow dark:bg-stone-900">
                      <Icon className="size-3 text-brand-500" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-stone-500">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="size-2.5 animate-pulse rounded-full bg-brand-500" aria-label="Unread" />}
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </Container>
  );
}
