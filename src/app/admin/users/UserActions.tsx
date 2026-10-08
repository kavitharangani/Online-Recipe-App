"use client";

import { Shield, ShieldOff, Trash2 } from "lucide-react";
import { deleteUser, setUserRole } from "@/actions/admin";
import { ConfirmButton } from "@/components/ui";
import type { Role } from "@/lib/types";

export function UserActions({ userId, name, role }: { userId: number; name: string; role: Role }) {
  const promote = role !== "admin";
  return (
    <div className="flex justify-end gap-1">
      <ConfirmButton
        action={() => setUserRole(userId, promote ? "admin" : "user")}
        confirmText={promote ? `Make ${name} an admin?` : `Remove admin rights from ${name}?`}
        className="btn-ghost !px-2.5 !py-1.5 text-xs"
      >
        {promote ? <Shield className="size-4" /> : <ShieldOff className="size-4" />}
        {promote ? "Make admin" : "Remove admin"}
      </ConfirmButton>
      <ConfirmButton
        action={() => deleteUser(userId)}
        confirmText={`Delete ${name} and all their recipes? This can't be undone.`}
        className="btn-ghost !px-2.5 !py-1.5 text-xs !text-red-600"
        title={`Delete ${name}`}
      >
        <Trash2 className="size-4" />
      </ConfirmButton>
    </div>
  );
}
