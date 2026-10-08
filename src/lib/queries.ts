import "server-only";
import { all, get } from "./db";
import type {
  Category,
  Ingredient,
  MealPlanEntry,
  Notification,
  RecipeDetail,
  RecipeSummary,
  Review,
  ShoppingItem,
  Step,
  User,
} from "./types";

const RECIPE_SELECT = `
  SELECT r.*, c.name AS category_name, c.slug AS category_slug, c.emoji AS category_emoji,
         u.name AS author_name, u.avatar AS author_avatar,
         (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE recipe_id = r.id) AS avg_rating,
         (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) AS review_count,
         (SELECT COUNT(*) FROM favorites WHERE recipe_id = r.id) AS favorite_count
  FROM recipes r
  JOIN users u ON u.id = r.user_id
  LEFT JOIN categories c ON c.id = r.category_id`;

export const SORTS = {
  newest: "r.created_at DESC",
  popular: "r.views DESC",
  rating: "avg_rating IS NULL, avg_rating DESC, review_count DESC",
  favorites: "favorite_count DESC",
  quickest: "(r.prep_time + r.cook_time) ASC",
} as const;
export type SortKey = keyof typeof SORTS;

export type RecipeFilters = {
  q?: string;
  category?: string;
  difficulty?: string;
  cuisine?: string;
  maxTime?: number;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

export function searchRecipes(filters: RecipeFilters) {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filters.q) {
    const like = `%${filters.q}%`;
    where.push(`(r.title LIKE ? OR r.description LIKE ? OR r.tags LIKE ? OR r.cuisine LIKE ?
      OR EXISTS (SELECT 1 FROM ingredients i WHERE i.recipe_id = r.id AND i.name LIKE ?))`);
    params.push(like, like, like, like, like);
  }
  if (filters.category) {
    where.push("c.slug = ?");
    params.push(filters.category);
  }
  if (filters.difficulty) {
    where.push("r.difficulty = ?");
    params.push(filters.difficulty);
  }
  if (filters.cuisine) {
    where.push("r.cuisine = ? COLLATE NOCASE");
    params.push(filters.cuisine);
  }
  if (filters.maxTime) {
    where.push("(r.prep_time + r.cook_time) <= ?");
    params.push(filters.maxTime);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const pageSize = filters.pageSize ?? 12;
  const page = Math.max(1, filters.page ?? 1);
  const order = SORTS[filters.sort ?? "newest"] ?? SORTS.newest;

  const total = get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM recipes r LEFT JOIN categories c ON c.id = r.category_id ${whereSql}`,
    params,
  )!.n;
  const recipes = all<RecipeSummary>(
    `${RECIPE_SELECT} ${whereSql} ORDER BY ${order}, r.id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  );
  return { recipes, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export function getRecipe(id: number): RecipeDetail | undefined {
  const recipe = get<RecipeSummary>(`${RECIPE_SELECT} WHERE r.id = ?`, id);
  if (!recipe) return undefined;
  const ingredients = all<Ingredient>(
    "SELECT id, position, quantity, unit, name FROM ingredients WHERE recipe_id = ? ORDER BY position",
    id,
  );
  const steps = all<Step>(
    "SELECT id, position, instruction, timer_minutes FROM steps WHERE recipe_id = ? ORDER BY position",
    id,
  );
  return { ...recipe, ingredients, steps };
}

export function getReviews(recipeId: number) {
  return all<Review>(
    `SELECT rv.*, u.name AS user_name, u.avatar AS user_avatar
     FROM reviews rv JOIN users u ON u.id = rv.user_id
     WHERE rv.recipe_id = ? ORDER BY rv.created_at DESC`,
    recipeId,
  );
}

export function getRatingBreakdown(recipeId: number) {
  const rows = all<{ rating: number; n: number }>(
    "SELECT rating, COUNT(*) AS n FROM reviews WHERE recipe_id = ? GROUP BY rating",
    recipeId,
  );
  return [5, 4, 3, 2, 1].map((rating) => ({ rating, count: rows.find((row) => row.rating === rating)?.n ?? 0 }));
}

export function getCategories() {
  return all<Category>(
    `SELECT c.*, (SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id) AS recipe_count
     FROM categories c ORDER BY c.name`,
  );
}

export function getCuisines() {
  return all<{ cuisine: string }>(
    "SELECT DISTINCT cuisine FROM recipes WHERE cuisine != '' ORDER BY cuisine COLLATE NOCASE",
  ).map((row) => row.cuisine);
}

export function getFeaturedRecipes(limit = 6) {
  return all<RecipeSummary>(`${RECIPE_SELECT} WHERE r.is_featured = 1 ORDER BY r.created_at DESC LIMIT ?`, limit);
}

export function getTopRatedRecipes(limit = 6) {
  return all<RecipeSummary>(`${RECIPE_SELECT} ORDER BY ${SORTS.rating} LIMIT ?`, limit);
}

export function getLatestRecipes(limit = 8) {
  return all<RecipeSummary>(`${RECIPE_SELECT} ORDER BY r.created_at DESC, r.id DESC LIMIT ?`, limit);
}

export function getRelatedRecipes(recipe: RecipeSummary, limit = 4) {
  return all<RecipeSummary>(
    `${RECIPE_SELECT} WHERE r.id != ? AND (r.category_id = ? OR r.cuisine = ?)
     ORDER BY (r.category_id = ?) DESC, r.views DESC LIMIT ?`,
    [recipe.id, recipe.category_id, recipe.cuisine, recipe.category_id, limit],
  );
}

export function getUserRecipes(userId: number) {
  return all<RecipeSummary>(`${RECIPE_SELECT} WHERE r.user_id = ? ORDER BY r.created_at DESC`, userId);
}

export function getFavoriteRecipes(userId: number) {
  return all<RecipeSummary>(
    `${RECIPE_SELECT} JOIN favorites f ON f.recipe_id = r.id AND f.user_id = ? ORDER BY f.created_at DESC`,
    userId,
  );
}

export function getFavoriteIds(userId: number | undefined): Set<number> {
  if (!userId) return new Set();
  return new Set(all<{ recipe_id: number }>("SELECT recipe_id FROM favorites WHERE user_id = ?", userId).map((row) => row.recipe_id));
}

export function getFollowingFeed(userId: number, limit = 8) {
  return all<RecipeSummary>(
    `${RECIPE_SELECT} WHERE r.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
     ORDER BY r.created_at DESC LIMIT ?`,
    [userId, limit],
  );
}

export type Profile = User & {
  recipe_count: number;
  follower_count: number;
  following_count: number;
  favorites_received: number;
  avg_rating: number | null;
};

export function getProfile(userId: number) {
  return get<Profile>(
    `SELECT u.id, u.name, u.email, u.bio, u.avatar, u.role, u.created_at,
       (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) AS recipe_count,
       (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
       (SELECT COUNT(*) FROM favorites f JOIN recipes r ON r.id = f.recipe_id WHERE r.user_id = u.id) AS favorites_received,
       (SELECT ROUND(AVG(rv.rating), 1) FROM reviews rv JOIN recipes r ON r.id = rv.recipe_id WHERE r.user_id = u.id) AS avg_rating
     FROM users u WHERE u.id = ?`,
    userId,
  );
}

export function isFollowing(followerId: number, followingId: number) {
  return !!get("SELECT 1 AS x FROM follows WHERE follower_id = ? AND following_id = ?", [followerId, followingId]);
}

export function getFollowList(userId: number, direction: "followers" | "following") {
  const [match, show] = direction === "followers" ? ["following_id", "follower_id"] : ["follower_id", "following_id"];
  return all<Pick<User, "id" | "name" | "avatar" | "bio">>(
    `SELECT u.id, u.name, u.avatar, u.bio FROM follows f JOIN users u ON u.id = f.${show}
     WHERE f.${match} = ? ORDER BY f.created_at DESC`,
    userId,
  );
}

export function getMealPlan(userId: number, from: string, to: string) {
  return all<MealPlanEntry>(
    `SELECT mp.id, mp.date, mp.meal_type, mp.recipe_id, r.title, r.image, r.prep_time, r.cook_time,
            c.emoji AS category_emoji
     FROM meal_plans mp JOIN recipes r ON r.id = mp.recipe_id LEFT JOIN categories c ON c.id = r.category_id
     WHERE mp.user_id = ? AND mp.date BETWEEN ? AND ? ORDER BY mp.date, mp.id`,
    [userId, from, to],
  );
}

export function getRecipeOptions() {
  return all<{ id: number; title: string }>("SELECT id, title FROM recipes ORDER BY title COLLATE NOCASE");
}

export function getShoppingItems(userId: number) {
  return all<ShoppingItem>(
    `SELECT s.id, s.name, s.quantity, s.unit, s.checked, s.recipe_id, r.title AS recipe_title
     FROM shopping_items s LEFT JOIN recipes r ON r.id = s.recipe_id
     WHERE s.user_id = ? ORDER BY s.checked, s.created_at DESC, s.id DESC`,
    userId,
  );
}

export function getNotifications(userId: number, limit = 50) {
  return all<Notification>(
    `SELECT n.id, n.type, n.message, n.is_read, n.created_at, n.recipe_id, n.actor_id,
            u.name AS actor_name, u.avatar AS actor_avatar
     FROM notifications n LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = ? ORDER BY n.created_at DESC, n.id DESC LIMIT ?`,
    [userId, limit],
  );
}

export function getUnreadCount(userId: number) {
  return get<{ n: number }>("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0", userId)!.n;
}

export function getDashboardStats(userId: number) {
  return get<{
    recipes: number;
    views: number;
    favorites: number;
    reviews: number;
    planned: number;
    shopping: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM recipes WHERE user_id = :id) AS recipes,
       (SELECT COALESCE(SUM(views), 0) FROM recipes WHERE user_id = :id) AS views,
       (SELECT COUNT(*) FROM favorites f JOIN recipes r ON r.id = f.recipe_id WHERE r.user_id = :id) AS favorites,
       (SELECT COUNT(*) FROM reviews rv JOIN recipes r ON r.id = rv.recipe_id WHERE r.user_id = :id) AS reviews,
       (SELECT COUNT(*) FROM meal_plans WHERE user_id = :id AND date >= date('now', 'localtime')) AS planned,
       (SELECT COUNT(*) FROM shopping_items WHERE user_id = :id AND checked = 0) AS shopping`,
    { ":id": userId },
  )!;
}

// ---- Admin ----

export function getAdminStats() {
  return get<{ users: number; recipes: number; reviews: number; categories: number; new_users: number; views: number }>(
    `SELECT (SELECT COUNT(*) FROM users) AS users,
            (SELECT COUNT(*) FROM recipes) AS recipes,
            (SELECT COUNT(*) FROM reviews) AS reviews,
            (SELECT COUNT(*) FROM categories) AS categories,
            (SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-7 days')) AS new_users,
            (SELECT COALESCE(SUM(views), 0) FROM recipes) AS views`,
  )!;
}

export function getAllUsers() {
  return all<User & { recipe_count: number }>(
    `SELECT u.id, u.name, u.email, u.bio, u.avatar, u.role, u.created_at,
            (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) AS recipe_count
     FROM users u ORDER BY u.created_at DESC, u.id DESC`,
  );
}

export function getAllRecipes() {
  return all<RecipeSummary>(`${RECIPE_SELECT} ORDER BY r.created_at DESC, r.id DESC`);
}
