"use client";

import { useFormStatus } from "react-dom";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

/** Submit button that shows a spinner while its form's Server Action runs. */
export function SubmitButton({
  children,
  pendingText,
  className = "btn-primary",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/** Runs a Server Action after a browser confirm() prompt. */
export function ConfirmButton({
  action,
  confirmText,
  children,
  className = "btn-danger",
  title,
}: {
  action: () => Promise<unknown>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={pending}
      className={className}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(async () => void (await action()));
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function FormMessage({ state }: { state?: { ok?: boolean; message?: string } }) {
  if (!state?.message) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        state.ok
          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
      }`}
    >
      {state.message}
    </p>
  );
}
