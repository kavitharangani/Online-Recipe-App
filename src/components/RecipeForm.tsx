"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Timer, Trash2 } from "lucide-react";
import { Reveal } from "./motion";
import { saveRecipe } from "@/actions/recipes";
import { formatQuantity } from "@/lib/format";
import { DIFFICULTIES, type Category, type RecipeDetail } from "@/lib/types";
import { FieldError, FormMessage } from "./ui";

type IngredientRow = { key: number; qty: string; unit: string; name: string };
type StepRow = { key: number; text: string; timer: string };

const UNITS = ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "cups", "pinch", "cloves", "slices", "pieces", "sprig", "inch", "can"];

let nextKey = 1;
const key = () => nextKey++;

function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export function RecipeForm({ recipe, categories }: { recipe?: RecipeDetail; categories: Category[] }) {
  const [state, formAction] = useActionState(saveRecipe, undefined);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState({
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    category_id: recipe?.category_id ? String(recipe.category_id) : "",
    cuisine: recipe?.cuisine ?? "",
    difficulty: recipe?.difficulty ?? "Easy",
    prep_time: String(recipe?.prep_time ?? 15),
    cook_time: String(recipe?.cook_time ?? 30),
    servings: String(recipe?.servings ?? 4),
    calories: recipe?.calories != null ? String(recipe.calories) : "",
    tags: recipe?.tags.split(",").join(", ") ?? "",
    tips: recipe?.tips ?? "",
  });
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    recipe?.ingredients.length
      ? recipe.ingredients.map((i) => ({ key: key(), qty: formatQuantity(i.quantity).replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, (g) => FRACTION_TEXT[g]).trim(), unit: i.unit, name: i.name }))
      : [{ key: key(), qty: "", unit: "", name: "" }, { key: key(), qty: "", unit: "", name: "" }],
  );
  const [steps, setSteps] = useState<StepRow[]>(() =>
    recipe?.steps.length
      ? recipe.steps.map((s) => ({ key: key(), text: s.instruction, timer: s.timer_minutes ? String(s.timer_minutes) : "" }))
      : [{ key: key(), text: "", timer: "" }],
  );
  const [preview, setPreview] = useState<string | null>(recipe?.image ?? null);
  const [removeImage, setRemoveImage] = useState(false);

  const errors = state?.errors ?? {};
  const set = (name: keyof typeof fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((current) => ({ ...current, [name]: event.target.value }));

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Submit manually so React doesn't reset the form (and the chosen photo) when validation fails.
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  function onImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {recipe && <input type="hidden" name="id" value={recipe.id} />}

      <Section title="The basics" description="What are you cooking?">
        <div className="grid gap-5 md:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="label">Recipe title *</label>
              <input id="title" name="title" value={fields.title} onChange={set("title")} className="input" placeholder="e.g. Grandma's coconut chicken curry" aria-invalid={!!errors.title} />
              <FieldError errors={errors.title} />
            </div>
            <div>
              <label htmlFor="description" className="label">Short description *</label>
              <textarea id="description" name="description" rows={4} value={fields.description} onChange={set("description")} className="input" placeholder="What makes this dish special?" aria-invalid={!!errors.description} />
              <FieldError errors={errors.description} />
            </div>
          </div>
          <div>
            <span className="label">Photo</span>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="group relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 transition hover:border-brand-400 dark:border-stone-700 dark:bg-stone-900"
            >
              {preview && !removeImage ? (
                <>
                  <img src={preview} alt="Recipe preview" className="absolute inset-0 size-full object-cover" />
                  <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Change photo
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-stone-500">
                  <ImagePlus className="size-8 text-stone-400" />
                  Upload a photo
                  <span className="text-xs text-stone-400">JPG, PNG, WebP · max 5 MB</span>
                </span>
              )}
            </button>
            <input ref={fileInput} type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onImage} className="sr-only" tabIndex={-1} />
            {preview && !removeImage && (
              <button
                type="button"
                onClick={() => {
                  setRemoveImage(true);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                className="mt-2 text-xs font-medium text-red-600 hover:underline"
              >
                Remove photo
              </button>
            )}
            {removeImage && <input type="hidden" name="remove_image" value="on" />}
            <FieldError errors={errors.image} />
          </div>
        </div>
      </Section>

      <Section title="Details" description="Help people find and plan your recipe.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="category_id" className="label">Category *</label>
            <select id="category_id" name="category_id" value={fields.category_id} onChange={set("category_id")} className="input" aria-invalid={!!errors.category_id}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
            <FieldError errors={errors.category_id} />
          </div>
          <div>
            <label htmlFor="cuisine" className="label">Cuisine</label>
            <input id="cuisine" name="cuisine" value={fields.cuisine} onChange={set("cuisine")} className="input" placeholder="e.g. Sri Lankan" list="cuisines" />
            <datalist id="cuisines">
              {["Sri Lankan", "Indian", "Italian", "Chinese", "Thai", "Mexican", "French", "American", "Greek", "Japanese"].map((c) => <option key={c} value={c} />)}
            </datalist>
            <FieldError errors={errors.cuisine} />
          </div>
          <div>
            <label htmlFor="difficulty" className="label">Difficulty *</label>
            <select id="difficulty" name="difficulty" value={fields.difficulty} onChange={set("difficulty")} className="input">
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="servings" className="label">Servings *</label>
            <input id="servings" name="servings" type="number" min={1} max={100} value={fields.servings} onChange={set("servings")} className="input" aria-invalid={!!errors.servings} />
            <FieldError errors={errors.servings} />
          </div>
          <div>
            <label htmlFor="prep_time" className="label">Prep time (min) *</label>
            <input id="prep_time" name="prep_time" type="number" min={0} value={fields.prep_time} onChange={set("prep_time")} className="input" aria-invalid={!!errors.prep_time} />
            <FieldError errors={errors.prep_time} />
          </div>
          <div>
            <label htmlFor="cook_time" className="label">Cook time (min) *</label>
            <input id="cook_time" name="cook_time" type="number" min={0} value={fields.cook_time} onChange={set("cook_time")} className="input" aria-invalid={!!errors.cook_time} />
            <FieldError errors={errors.cook_time} />
          </div>
          <div>
            <label htmlFor="calories" className="label">Calories / serving</label>
            <input id="calories" name="calories" type="number" min={0} value={fields.calories} onChange={set("calories")} className="input" placeholder="Optional" aria-invalid={!!errors.calories} />
            <FieldError errors={errors.calories} />
          </div>
          <div>
            <label htmlFor="tags" className="label">Tags</label>
            <input id="tags" name="tags" value={fields.tags} onChange={set("tags")} className="input" placeholder="spicy, quick, vegan" />
            <FieldError errors={errors.tags} />
          </div>
        </div>
      </Section>

      <Section title="Ingredients" description='Amounts can be whole numbers, decimals or fractions like "1/2". Leave blank for "to taste".'>
        <datalist id="units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
          {ingredients.map((row, index) => (
            <motion.li
              layout
              key={row.key}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="grid grid-cols-[70px_90px_1fr_auto] gap-2 sm:grid-cols-[90px_110px_1fr_auto]"
            >
              <input
                name="ing_qty"
                value={row.qty}
                onChange={(e) => setIngredients((list) => list.map((r) => (r.key === row.key ? { ...r, qty: e.target.value } : r)))}
                className="input"
                placeholder="1 1/2"
                aria-label={`Amount for ingredient ${index + 1}`}
              />
              <input
                name="ing_unit"
                value={row.unit}
                onChange={(e) => setIngredients((list) => list.map((r) => (r.key === row.key ? { ...r, unit: e.target.value } : r)))}
                className="input"
                placeholder="cup"
                list="units"
                aria-label={`Unit for ingredient ${index + 1}`}
              />
              <input
                name="ing_name"
                value={row.name}
                onChange={(e) => setIngredients((list) => list.map((r) => (r.key === row.key ? { ...r, name: e.target.value } : r)))}
                className="input"
                placeholder="Ingredient, e.g. coconut milk"
                aria-label={`Ingredient ${index + 1}`}
              />
              <RowControls
                onUp={() => setIngredients((list) => move(list, index, -1))}
                onDown={() => setIngredients((list) => move(list, index, 1))}
                onRemove={() => setIngredients((list) => (list.length > 1 ? list.filter((r) => r.key !== row.key) : list))}
              />
            </motion.li>
          ))}
          </AnimatePresence>
        </ul>
        <FieldError errors={errors.ingredients} />
        <button type="button" onClick={() => setIngredients((list) => [...list, { key: key(), qty: "", unit: "", name: "" }])} className="btn-ghost mt-3 !text-brand-600">
          <Plus className="size-4" /> Add ingredient
        </button>
      </Section>

      <Section title="Method" description="Break it into clear steps. Add a timer to any step that needs one.">
        <ol className="space-y-3">
          <AnimatePresence initial={false}>
          {steps.map((row, index) => (
            <motion.li
              layout
              key={row.key}
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="flex gap-3"
            >
              <span className="mt-2 grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <textarea
                  name="step_text"
                  rows={2}
                  value={row.text}
                  onChange={(e) => setSteps((list) => list.map((r) => (r.key === row.key ? { ...r, text: e.target.value } : r)))}
                  className="input"
                  placeholder="Describe this step…"
                  aria-label={`Step ${index + 1}`}
                />
                <label className="flex items-center gap-2 text-sm text-stone-500">
                  <Timer className="size-4" />
                  <input
                    name="step_timer"
                    type="number"
                    min={0}
                    max={600}
                    value={row.timer}
                    onChange={(e) => setSteps((list) => list.map((r) => (r.key === row.key ? { ...r, timer: e.target.value } : r)))}
                    className="input !w-24 !py-1.5"
                    placeholder="—"
                  />
                  minute timer (optional)
                </label>
              </div>
              <RowControls
                onUp={() => setSteps((list) => move(list, index, -1))}
                onDown={() => setSteps((list) => move(list, index, 1))}
                onRemove={() => setSteps((list) => (list.length > 1 ? list.filter((r) => r.key !== row.key) : list))}
              />
            </motion.li>
          ))}
          </AnimatePresence>
        </ol>
        <FieldError errors={errors.steps} />
        <button type="button" onClick={() => setSteps((list) => [...list, { key: key(), text: "", timer: "" }])} className="btn-ghost mt-3 !text-brand-600">
          <Plus className="size-4" /> Add step
        </button>
      </Section>

      <Section title="Cook's tips" description="Optional secrets, swaps or serving suggestions.">
        <textarea name="tips" rows={3} value={fields.tips} onChange={set("tips")} className="input" placeholder="e.g. Tastes even better the next day!" />
        <FieldError errors={errors.tips} />
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
        <div className="flex-1"><FormMessage state={state} /></div>
        <button type="button" onClick={() => history.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={pending} className="btn-primary !px-6">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {recipe ? "Save changes" : "Publish recipe"}
        </button>
      </div>
    </form>
  );
}

const FRACTION_TEXT: Record<string, string> = {
  "¼": " 1/4", "½": " 1/2", "¾": " 3/4", "⅓": " 1/3", "⅔": " 2/3", "⅛": " 1/8", "⅜": " 3/8", "⅝": " 5/8", "⅞": " 7/8",
};

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Reveal kind="fade-up">
      <section className="card p-6">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="mb-5 text-sm text-stone-500">{description}</p>
        {children}
      </section>
    </Reveal>
  );
}

function RowControls({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-0.5">
      <button type="button" onClick={onUp} className="btn-ghost !p-2" aria-label="Move up"><ArrowUp className="size-4" /></button>
      <button type="button" onClick={onDown} className="btn-ghost !p-2" aria-label="Move down"><ArrowDown className="size-4" /></button>
      <button type="button" onClick={onRemove} className="btn-ghost !p-2 hover:!text-red-600" aria-label="Remove"><Trash2 className="size-4" /></button>
    </div>
  );
}
