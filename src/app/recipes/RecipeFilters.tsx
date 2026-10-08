"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { Search, X } from "lucide-react";

type Values = { q: string; category: string; difficulty: string; cuisine: string; maxTime: string; sort: string };

export function RecipeFilters({
  values,
  categories,
  cuisines,
}: {
  values: Values;
  categories: { slug: string; name: string; emoji: string }[];
  cuisines: string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();
  const hasFilters = Object.entries(values).some(([key, value]) => value && key !== "sort");

  return (
    // `key` resets the uncontrolled fields when the URL changes (e.g. via the "clear" link).
    <Form ref={formRef} action="/recipes" key={JSON.stringify(values)} className="card grid gap-3 p-4 md:grid-cols-6">
      <label className="relative md:col-span-2">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
        <input name="q" defaultValue={values.q} placeholder="Search recipes or ingredients…" className="input !pl-9" />
      </label>
      <Select name="category" value={values.category} onChange={submit} label="Category">
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
        ))}
      </Select>
      <Select name="difficulty" value={values.difficulty} onChange={submit} label="Difficulty">
        <option value="">Any difficulty</option>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </Select>
      <Select name="maxTime" value={values.maxTime} onChange={submit} label="Total time">
        <option value="">Any time</option>
        <option value="15">Under 15 min</option>
        <option value="30">Under 30 min</option>
        <option value="60">Under 1 hour</option>
        <option value="120">Under 2 hours</option>
      </Select>
      <Select name="cuisine" value={values.cuisine} onChange={submit} label="Cuisine">
        <option value="">All cuisines</option>
        {cuisines.map((cuisine) => (
          <option key={cuisine}>{cuisine}</option>
        ))}
      </Select>
      <div className="flex flex-wrap items-center gap-3 md:col-span-6">
        <Select name="sort" value={values.sort} onChange={submit} label="Sort by" className="w-auto">
          <option value="newest">Newest first</option>
          <option value="rating">Top rated</option>
          <option value="popular">Most viewed</option>
          <option value="favorites">Most saved</option>
          <option value="quickest">Quickest</option>
        </Select>
        <button className="btn-primary">Apply</button>
        {hasFilters && (
          <Link href="/recipes" className="btn-ghost">
            <X className="size-4" /> Clear filters
          </Link>
        )}
      </div>
    </Form>
  );
}

function Select({
  name,
  value,
  onChange,
  label,
  children,
  className = "",
}: {
  name: string;
  value: string;
  onChange: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="sr-only">{label}</span>
      <select name={name} defaultValue={value} onChange={onChange} className="input">
        {children}
      </select>
    </label>
  );
}
