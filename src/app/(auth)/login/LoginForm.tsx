"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui";
import { useShake } from "@/components/useShake";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, undefined);
  // A fresh state object arrives on every failed submit, so the form shakes each time.
  const formRef = useShake<HTMLFormElement>(state?.errors || state?.message ? state : null);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back 👋</h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        {next === "/recipes/new"
          ? "Log in or create a free account to share your recipe."
          : "Log in to your recipes, planner and shopping list."}
      </p>

      <form ref={formRef} action={action} className="mt-8 space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <FormMessage state={state} />
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input key={state?.values?.email} defaultValue={state?.values?.email} id="email" name="email" type="email" autoComplete="email" className="input" aria-invalid={!!state?.errors?.email} required />
          <FieldError errors={state?.errors?.email} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" className="input" aria-invalid={!!state?.errors?.password} required />
          <FieldError errors={state?.errors?.password} />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Logging in…">Log in</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        New to Flavorly?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-brand-600 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
