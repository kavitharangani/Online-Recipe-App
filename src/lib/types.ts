export type Role = "user" | "admin";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export type User = {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar: string | null;
  role: Role;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  recipe_count?: number;
};

/** A recipe row joined with its author, category and rating summary. */
export type RecipeSummary = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image: string | null;
  cuisine: string;
  difficulty: Difficulty;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number | null;
  tags: string;
  tips: string;
  is_featured: number;
  views: number;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  category_emoji: string | null;
  author_name: string;
  author_avatar: string | null;
  avg_rating: number | null;
  review_count: number;
  favorite_count: number;
};

export type Ingredient = {
  id: number;
  position: number;
  quantity: number | null;
  unit: string;
  name: string;
};

export type Step = {
  id: number;
  position: number;
  instruction: string;
  timer_minutes: number | null;
};

export type RecipeDetail = RecipeSummary & {
  ingredients: Ingredient[];
  steps: Step[];
};

export type Review = {
  id: number;
  recipe_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
};

export type MealPlanEntry = {
  id: number;
  date: string;
  meal_type: MealType;
  recipe_id: number;
  title: string;
  image: string | null;
  category_emoji: string | null;
  prep_time: number;
  cook_time: number;
};

export type ShoppingItem = {
  id: number;
  name: string;
  quantity: number | null;
  unit: string;
  checked: number;
  recipe_id: number | null;
  recipe_title: string | null;
};

export type Notification = {
  id: number;
  type: string;
  message: string;
  is_read: number;
  created_at: string;
  recipe_id: number | null;
  actor_id: number | null;
  actor_name: string | null;
  actor_avatar: string | null;
};

/** Shape returned by form Server Actions used with useActionState. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Echo of submitted text fields so forms can refill themselves after React resets them. */
  values?: Record<string, string>;
} | undefined;
