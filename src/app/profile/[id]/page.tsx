import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Settings, Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { getFavoriteIds, getFollowList, getProfile, getUserRecipes, isFollowing } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { RecipeGrid } from "@/components/RecipeCard";
import { Container, EmptyState } from "@/components/layout";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";

export async function generateMetadata({ params }: PageProps<"/profile/[id]">): Promise<Metadata> {
  const profile = getProfile(Number((await params).id));
  return { title: profile?.name ?? "Profile" };
}

export default async function ProfilePage({ params, searchParams }: PageProps<"/profile/[id]">) {
  const profile = getProfile(Number((await params).id));
  if (!profile) notFound();
  const { tab } = await searchParams;
  const viewer = await getCurrentUser();
  const isMe = viewer?.id === profile.id;
  const recipes = getUserRecipes(profile.id);
  const activeTab = tab === "followers" || tab === "following" ? tab : "recipes";
  const people = activeTab === "recipes" ? [] : getFollowList(profile.id, activeTab);

  const stats = [
    { label: "Recipes", value: profile.recipe_count, tab: "recipes" },
    { label: "Followers", value: profile.follower_count, tab: "followers" },
    { label: "Following", value: profile.following_count, tab: "following" },
  ];

  return (
    <Container>
      <Reveal kind="zoom" className="card overflow-hidden">
        <div className="h-32 animate-[gradient_8s_ease_infinite] bg-[length:200%_200%] bg-gradient-to-r from-brand-300 via-brand-400 to-rose-400 dark:from-brand-700 dark:via-brand-600 dark:to-rose-700" />
        <div className="flex flex-wrap items-end gap-6 px-6 pb-6">
          <Reveal kind="zoom" delay={0.25} className="-mt-12">
            <Avatar name={profile.name} src={profile.avatar} size="xl" />
          </Reveal>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 font-display text-3xl font-semibold">
              {profile.name}
              {profile.role === "admin" && (
                <span className="chip !bg-brand-100 !text-brand-800 dark:!bg-brand-500/15 dark:!text-brand-300">
                  <Shield className="size-3" /> Admin
                </span>
              )}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
              <CalendarDays className="size-4" /> Cooking on Flavorly since {formatDate(profile.created_at)}
            </p>
          </div>
          {isMe ? (
            <Link href="/settings" className="btn-secondary"><Settings className="size-4" /> Edit profile</Link>
          ) : (
            <FollowButton userId={profile.id} initial={viewer ? isFollowing(viewer.id, profile.id) : false} signedIn={!!viewer} />
          )}
        </div>
        {profile.bio && <p className="px-6 pb-6 text-stone-600 dark:text-stone-300">{profile.bio}</p>}
        <div className="grid grid-cols-2 border-t border-stone-100 sm:grid-cols-5 dark:border-stone-800">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={`/profile/${profile.id}${stat.tab === "recipes" ? "" : `?tab=${stat.tab}`}`}
              className={`px-6 py-4 text-center transition hover:bg-stone-50 dark:hover:bg-stone-800 ${
                activeTab === stat.tab ? "border-b-2 border-brand-500" : ""
              }`}
            >
              <p className="font-display text-2xl font-semibold"><CountUp value={stat.value} /></p>
              <p className="text-xs text-stone-500">{stat.label}</p>
            </Link>
          ))}
          <div className="px-6 py-4 text-center">
            <p className="font-display text-2xl font-semibold"><CountUp value={profile.favorites_received} /></p>
            <p className="text-xs text-stone-500">Times saved</p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className="font-display text-2xl font-semibold">{profile.avg_rating ? <CountUp value={profile.avg_rating} decimals={1} prefix="★ " /> : "–"}</p>
            <p className="text-xs text-stone-500">Avg. rating</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-10">
        {activeTab === "recipes" ? (
          recipes.length ? (
            <RecipeGrid recipes={recipes} favoriteIds={getFavoriteIds(viewer?.id)} signedIn={!!viewer} />
          ) : (
            <EmptyState
              emoji="🍳"
              title={isMe ? "You haven't shared any recipes yet" : `${profile.name} hasn't shared any recipes yet`}
              text={isMe ? "Your published recipes will appear here." : "Check back soon!"}
              action={isMe ? { href: "/recipes/new", label: "Share a recipe" } : undefined}
            />
          )
        ) : people.length ? (
          <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <StaggerItem as="li" kind="pop" key={person.id}>
                <Link href={`/profile/${person.id}`} className="card flex items-center gap-3 p-4 transition hover:border-brand-300">
                  <Avatar name={person.name} src={person.avatar} />
                  <div className="min-w-0">
                    <p className="font-semibold">{person.name}</p>
                    <p className="truncate text-xs text-stone-500">{person.bio || "Flavorly cook"}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState emoji="👥" title={activeTab === "followers" ? "No followers yet" : "Not following anyone yet"} text="Follow cooks to see their new recipes on your dashboard." />
        )}
      </div>
    </Container>
  );
}
