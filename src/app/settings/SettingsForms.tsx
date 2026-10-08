"use client";

import { useActionState, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { changePassword, deleteAccount, updateProfile } from "@/actions/account";
import { Avatar } from "@/components/Avatar";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui";

function Panel({ title, description, children, danger }: { title: string; description: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`card p-6 ${danger ? "!border-red-200 dark:!border-red-500/30" : ""}`}>
      <h2 className={`font-display text-xl font-semibold ${danger ? "text-red-600" : ""}`}>{title}</h2>
      <p className="mb-5 text-sm text-stone-500">{description}</p>
      {children}
    </section>
  );
}

export function ProfileForm({ user }: { user: { name: string; email: string; bio: string; avatar: string | null } }) {
  const [state, action] = useActionState(updateProfile, undefined);
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const shown = removed ? null : (preview ?? user.avatar);

  return (
    <Panel title="Profile" description="This is how other cooks see you.">
      <form action={action} className="space-y-5">
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => fileInput.current?.click()} className="group relative rounded-full" aria-label="Change profile photo">
            <Avatar name={user.name} src={shown} size="xl" />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="size-6" />
            </span>
          </button>
          <div className="space-y-1 text-sm">
            <button type="button" onClick={() => fileInput.current?.click()} className="font-semibold text-brand-600 hover:underline">
              Upload new photo
            </button>
            {shown && (
              <button
                type="button"
                className="block text-red-600 hover:underline"
                onClick={() => {
                  setRemoved(true);
                  setPreview(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                Remove photo
              </button>
            )}
            <p className="text-xs text-stone-400">JPG, PNG or WebP, up to 5 MB.</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setRemoved(false);
              }
            }}
          />
          {removed && <input type="hidden" name="remove_avatar" value="on" />}
        </div>
        <FieldError errors={state?.errors?.avatar} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" name="name" defaultValue={user.name} className="input" aria-invalid={!!state?.errors?.name} />
            <FieldError errors={state?.errors?.name} />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" defaultValue={user.email} className="input" aria-invalid={!!state?.errors?.email} />
            <FieldError errors={state?.errors?.email} />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea id="bio" name="bio" rows={3} defaultValue={user.bio} className="input" placeholder="Tell us about your cooking style…" />
          <FieldError errors={state?.errors?.bio} />
        </div>
        <FormMessage state={state} />
        <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
      </form>
    </Panel>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  return (
    <Panel title="Password" description="Use at least 8 characters with a letter and a number.">
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="current" className="label">Current password</label>
          <input id="current" name="current" type="password" autoComplete="current-password" className="input" aria-invalid={!!state?.errors?.current} />
          <FieldError errors={state?.errors?.current} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="new-password" className="label">New password</label>
            <input id="new-password" name="password" type="password" autoComplete="new-password" className="input" aria-invalid={!!state?.errors?.password} />
            <FieldError errors={state?.errors?.password} />
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm new password</label>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" className="input" aria-invalid={!!state?.errors?.confirm} />
            <FieldError errors={state?.errors?.confirm} />
          </div>
        </div>
        <FormMessage state={state} />
        <SubmitButton pendingText="Updating…">Update password</SubmitButton>
      </form>
    </Panel>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccount, undefined);
  return (
    <Panel title="Delete account" description="Permanently delete your account, recipes, reviews, meal plans and shopping list." danger>
      <form
        action={action}
        className="flex flex-wrap items-start gap-3"
        onSubmit={(event) => {
          if (!window.confirm("Delete your account permanently? This cannot be undone.")) event.preventDefault();
        }}
      >
        <div className="min-w-60 flex-1">
          <label htmlFor="delete-password" className="sr-only">Confirm with your password</label>
          <input id="delete-password" name="password" type="password" placeholder="Enter your password to confirm" className="input" aria-invalid={!!state?.errors?.password} />
          <FieldError errors={state?.errors?.password} />
        </div>
        <SubmitButton className="btn-danger" pendingText="Deleting…">Delete my account</SubmitButton>
        <div className="w-full"><FormMessage state={state} /></div>
      </form>
    </Panel>
  );
}
