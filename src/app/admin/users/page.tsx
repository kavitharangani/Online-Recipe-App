import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { getAllUsers } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { UserActions } from "./UserActions";

export const metadata: Metadata = { title: "Users · Admin" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = getAllUsers();

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-stone-100 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:border-stone-800 dark:bg-stone-800/50">
          <tr>
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Recipes</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <span>
                    <span className="block font-medium hover:text-brand-600">{user.name}{user.id === admin.id && " (you)"}</span>
                    <span className="block text-xs text-stone-500">{user.email}</span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className={`chip ${user.role === "admin" ? "!bg-brand-100 !text-brand-800 dark:!bg-brand-500/15 dark:!text-brand-300" : ""}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3">{user.recipe_count}</td>
              <td className="px-4 py-3 text-stone-500">{formatDate(user.created_at)}</td>
              <td className="px-4 py-3">
                {user.id !== admin.id && <UserActions userId={user.id} name={user.name} role={user.role} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
