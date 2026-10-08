"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check } from "lucide-react";
import { register } from "@/actions/auth";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui";
import { useShake } from "@/components/useShake";

const RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: "A number", test: (p: string) => /[0-9]/.test(p) },
];

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(register, undefined);
  // A fresh state object arrives on every failed submit, so the form shakes each time.
  const formRef = useShake<HTMLFormElement>(state?.errors || state?.message ? state : null);
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Join Flavorly 🍳</h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        {next === "/recipes/new"
          ? "Create a free account to share your recipe with everyone."
          : "Create a free account to save, share and plan recipes."}
      </p>

      <form ref={formRef} action={action} className="mt-8 space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <FormMessage state={state} />
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input key={state?.values?.name} defaultValue={state?.values?.name} id="name" name="name" autoComplete="name" className="input" aria-invalid={!!state?.errors?.name} required />
          <FieldError errors={state?.errors?.name} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input key={state?.values?.email} defaultValue={state?.values?.email} id="email" name="email" type="email" autoComplete="email" className="input" aria-invalid={!!state?.errors?.email} required />
          <FieldError errors={state?.errors?.email} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!state?.errors?.password}
            required
          />
          <ul className="mt-2 flex flex-wrap gap-2">
            {RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={`chip ${ok ? "!bg-emerald-100 !text-emerald-800 dark:!bg-emerald-500/15 dark:!text-emerald-300" : ""}`}
                >
                  <Check className={`size-3 ${ok ? "" : "opacity-30"}`} /> {rule.label}
                </li>
              );
            })}
          </ul>
          <FieldError errors={state?.errors?.password} />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" className="input" aria-invalid={!!state?.errors?.confirm} required />
          <FieldError errors={state?.errors?.confirm} />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Creating account…">Create account</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
