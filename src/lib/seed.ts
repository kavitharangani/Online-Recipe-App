import bcrypt from "bcryptjs";
import type { Database } from "node-sqlite3-wasm";

type SeedIngredient = [quantity: number | null, unit: string, name: string];
type SeedStep = string | [instruction: string, timerMinutes: number];

type SeedRecipe = {
  author: number;
  category: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prep: number;
  cook: number;
  servings: number;
  calories: number;
  tags: string;
  tips?: string;
  featured?: boolean;
  ingredients: SeedIngredient[];
  steps: SeedStep[];
};

const CATEGORIES: [name: string, emoji: string][] = [
  ["Breakfast", "🥞"],
  ["Rice & Curry", "🍛"],
  ["Main Course", "🍝"],
  ["Soups", "🍲"],
  ["Salads", "🥗"],
  ["Snacks", "🥟"],
  ["Desserts", "🍰"],
  ["Baking", "🥐"],
  ["Drinks", "🥤"],
];

const USERS = [
  { name: "Flavorly Admin", email: "admin@flavorly.com", password: "Admin@123", role: "admin", bio: "Keeping the Flavorly kitchen clean and tidy." },
  { name: "Nimali Perera", email: "nimali@flavorly.com", password: "Demo@123", role: "user", bio: "Home cook from Kandy. I love sharing my amma's Sri Lankan recipes." },
  { name: "Kasun Fernando", email: "kasun@flavorly.com", password: "Demo@123", role: "user", bio: "Weekend baker and pasta enthusiast. Always experimenting." },
];

const RECIPES: SeedRecipe[] = [
  {
    author: 2, category: "Rice & Curry", title: "Sri Lankan Chicken Curry",
    description: "A rich, aromatic chicken curry simmered in roasted curry powder and creamy coconut milk — the heart of any Sunday rice and curry.",
    cuisine: "Sri Lankan", difficulty: "Medium", prep: 20, cook: 45, servings: 4, calories: 420,
    tags: "spicy,coconut,chicken,sunday lunch", featured: true,
    tips: "Roast the curry powder in a dry pan until fragrant for a deeper, smokier flavour.",
    ingredients: [
      [1, "kg", "chicken, cut into pieces"], [2, "tbsp", "roasted curry powder"], [1, "tsp", "chilli powder"],
      [0.5, "tsp", "turmeric"], [1, "", "large red onion, sliced"], [4, "cloves", "garlic, minced"],
      [1, "inch", "ginger, minced"], [1, "sprig", "curry leaves"], [2, "pieces", "pandan leaf"],
      [400, "ml", "thick coconut milk"], [2, "tbsp", "coconut oil"], [1, "tsp", "salt"],
    ],
    steps: [
      "Marinate the chicken with curry powder, chilli powder, turmeric and salt for at least 15 minutes.",
      "Heat coconut oil in a heavy pan. Add onion, garlic, ginger, curry leaves and pandan and fry until golden.",
      ["Add the chicken and cook on medium heat, stirring, until the pieces are sealed on all sides.", 8],
      ["Pour in half the coconut milk with 1/2 cup water, cover and simmer until the chicken is tender.", 25],
      ["Stir in the remaining coconut milk and simmer uncovered until the gravy thickens.", 10],
      "Taste, adjust salt and serve hot with rice.",
    ],
  },
  {
    author: 2, category: "Rice & Curry", title: "Parippu (Red Lentil Dhal)",
    description: "Silky red lentils cooked with turmeric and finished with a crackling tempering of mustard seeds, onions and curry leaves.",
    cuisine: "Sri Lankan", difficulty: "Easy", prep: 10, cook: 25, servings: 4, calories: 260,
    tags: "vegan,vegetarian,lentils,comfort food",
    ingredients: [
      [1, "cup", "red lentils (masoor dhal), washed"], [0.5, "tsp", "turmeric"], [1, "", "green chilli, slit"],
      [1, "", "small onion, sliced"], [1, "cup", "coconut milk"], [1, "tsp", "mustard seeds"],
      [1, "sprig", "curry leaves"], [2, "", "dried red chillies"], [1, "tbsp", "coconut oil"], [1, "tsp", "salt"],
    ],
    steps: [
      ["Boil the lentils with 2 cups water, turmeric, green chilli and half the onion until soft.", 15],
      "Add coconut milk and salt; simmer gently until creamy.",
      "In a small pan heat the oil, add mustard seeds, remaining onion, dried chillies and curry leaves.",
      "Fry until the onions are golden, then pour the tempering over the dhal and stir.",
    ],
  },
  {
    author: 2, category: "Breakfast", title: "Kiribath (Milk Rice)",
    description: "Creamy coconut milk rice cut into diamonds — a celebratory Sri Lankan breakfast for New Year and special mornings.",
    cuisine: "Sri Lankan", difficulty: "Easy", prep: 5, cook: 30, servings: 4, calories: 350,
    tags: "rice,coconut,new year,traditional", featured: true,
    ingredients: [[2, "cups", "white raw rice"], [3, "cups", "water"], [1.5, "cups", "thick coconut milk"], [1, "tsp", "salt"]],
    steps: [
      ["Wash the rice and cook it with water until the water is absorbed and the rice is very soft.", 20],
      ["Add coconut milk and salt. Stir on low heat until the milk is fully absorbed and the rice is creamy.", 8],
      "Spread onto a flat plate, smooth the top with a banana leaf or spatula, and let it set slightly.",
      "Cut into diamond shapes and serve with lunu miris or pol sambol.",
    ],
  },
  {
    author: 2, category: "Snacks", title: "Pol Sambol",
    description: "Fresh grated coconut tossed with chilli, onion, lime and Maldive fish. Bright, punchy and ready in minutes.",
    cuisine: "Sri Lankan", difficulty: "Easy", prep: 10, cook: 0, servings: 4, calories: 150,
    tags: "coconut,no cook,side dish,spicy",
    ingredients: [
      [2, "cups", "freshly grated coconut"], [1, "tsp", "chilli flakes"], [1, "", "small red onion, finely chopped"],
      [1, "tbsp", "Maldive fish flakes"], [1, "", "lime, juiced"], [0.5, "tsp", "salt"],
    ],
    steps: [
      "Grind the onion, chilli flakes, Maldive fish and salt into a rough paste.",
      "Mix the paste into the grated coconut with your fingertips until evenly red.",
      "Squeeze over the lime juice, taste and adjust salt. Serve immediately.",
    ],
  },
  {
    author: 3, category: "Main Course", title: "Classic Spaghetti Carbonara",
    description: "The real Roman way: eggs, pecorino, crispy pancetta and black pepper. No cream, all silk.",
    cuisine: "Italian", difficulty: "Medium", prep: 10, cook: 15, servings: 2, calories: 640,
    tags: "pasta,quick,italian,dinner", featured: true,
    tips: "Take the pan off the heat before adding the eggs so they turn into sauce, not scrambled eggs.",
    ingredients: [
      [200, "g", "spaghetti"], [100, "g", "pancetta or guanciale, diced"], [2, "", "large eggs"],
      [1, "", "egg yolk"], [50, "g", "pecorino romano, finely grated"], [1, "tsp", "freshly ground black pepper"],
    ],
    steps: [
      ["Cook the spaghetti in well-salted boiling water until al dente.", 9],
      "Meanwhile, fry the pancetta in a dry pan until crisp and golden.",
      "Whisk eggs, yolk, pecorino and pepper in a bowl.",
      "Toss the drained pasta with the pancetta off the heat, then stir in the egg mixture with a splash of pasta water until glossy.",
      "Serve at once with extra cheese and pepper.",
    ],
  },
  {
    author: 3, category: "Breakfast", title: "Fluffy Buttermilk Pancakes",
    description: "Tall, tender pancakes with crisp edges. A lazy-weekend staple that's ready in 20 minutes.",
    cuisine: "American", difficulty: "Easy", prep: 10, cook: 10, servings: 4, calories: 310,
    tags: "sweet,weekend,kids,quick",
    ingredients: [
      [2, "cups", "all-purpose flour"], [2, "tbsp", "sugar"], [2, "tsp", "baking powder"], [0.5, "tsp", "baking soda"],
      [0.5, "tsp", "salt"], [2, "cups", "buttermilk"], [2, "", "eggs"], [3, "tbsp", "melted butter"],
    ],
    steps: [
      "Whisk the dry ingredients together in a large bowl.",
      "Whisk buttermilk, eggs and melted butter in another bowl, then fold into the dry ingredients — a few lumps are fine.",
      ["Rest the batter while the pan heats.", 5],
      "Cook 1/4 cup portions on a buttered pan until bubbles form, flip and cook until golden.",
      "Serve warm with maple syrup and fresh fruit.",
    ],
  },
  {
    author: 3, category: "Desserts", title: "Molten Chocolate Lava Cakes",
    description: "Individual chocolate cakes with a gooey, flowing centre. Restaurant-worthy and surprisingly simple.",
    cuisine: "French", difficulty: "Medium", prep: 15, cook: 12, servings: 4, calories: 480,
    tags: "chocolate,dessert,date night,baking", featured: true,
    ingredients: [
      [115, "g", "dark chocolate"], [115, "g", "butter"], [2, "", "eggs"], [2, "", "egg yolks"],
      [50, "g", "sugar"], [2, "tbsp", "flour"], [1, "pinch", "salt"],
    ],
    steps: [
      "Preheat the oven to 220°C and butter four ramekins.",
      "Melt chocolate and butter together, then let cool slightly.",
      "Whisk eggs, yolks and sugar until pale, then fold in the chocolate, flour and salt.",
      ["Divide into ramekins and bake until the edges are set but the centre wobbles.", 12],
      "Rest 1 minute, run a knife around the edge and invert onto plates.",
    ],
  },
  {
    author: 2, category: "Soups", title: "Roasted Tomato Basil Soup",
    description: "Oven-roasted tomatoes blended with garlic and fresh basil into a velvety, comforting soup.",
    cuisine: "Italian", difficulty: "Easy", prep: 10, cook: 40, servings: 4, calories: 190,
    tags: "vegetarian,soup,comfort food,healthy",
    ingredients: [
      [1, "kg", "ripe tomatoes, halved"], [1, "", "onion, quartered"], [6, "cloves", "garlic"], [3, "tbsp", "olive oil"],
      [2, "cups", "vegetable stock"], [1, "cup", "fresh basil leaves"], [1, "tsp", "salt"], [0.5, "cup", "cream (optional)"],
    ],
    steps: [
      ["Toss tomatoes, onion and garlic with oil and salt; roast at 200°C until caramelised.", 30],
      "Transfer to a pot with the stock and basil and simmer for 10 minutes.",
      "Blend until smooth, stir in cream if using and season to taste.",
    ],
  },
  {
    author: 3, category: "Salads", title: "Greek Village Salad",
    description: "Juicy tomatoes, cucumber, olives and a slab of feta dressed simply with olive oil and oregano.",
    cuisine: "Greek", difficulty: "Easy", prep: 15, cook: 0, servings: 2, calories: 280,
    tags: "vegetarian,no cook,healthy,summer",
    ingredients: [
      [3, "", "tomatoes, cut into wedges"], [1, "", "cucumber, sliced"], [0.5, "", "red onion, thinly sliced"],
      [1, "", "green pepper, sliced"], [0.5, "cup", "kalamata olives"], [150, "g", "feta cheese"],
      [3, "tbsp", "extra-virgin olive oil"], [1, "tsp", "dried oregano"],
    ],
    steps: [
      "Arrange tomatoes, cucumber, onion and pepper in a shallow bowl.",
      "Scatter the olives and lay the feta on top.",
      "Drizzle with olive oil, sprinkle oregano and season with salt and pepper.",
    ],
  },
  {
    author: 3, category: "Baking", title: "Banana Bread",
    description: "Moist, tender banana bread with a crackly top — the best way to use up overripe bananas.",
    cuisine: "American", difficulty: "Easy", prep: 15, cook: 60, servings: 8, calories: 290,
    tags: "baking,banana,snack,kids",
    ingredients: [
      [3, "", "very ripe bananas, mashed"], [80, "g", "melted butter"], [150, "g", "brown sugar"], [1, "", "egg"],
      [1, "tsp", "vanilla extract"], [1, "tsp", "baking soda"], [190, "g", "all-purpose flour"], [1, "pinch", "salt"],
    ],
    steps: [
      "Preheat the oven to 175°C and line a loaf tin.",
      "Mix the mashed bananas with melted butter, then beat in sugar, egg and vanilla.",
      "Sprinkle over the baking soda and salt, then fold in the flour until just combined.",
      ["Pour into the tin and bake until a skewer comes out clean.", 60],
      "Cool for 10 minutes in the tin before slicing.",
    ],
  },
  {
    author: 2, category: "Drinks", title: "Mango Lassi",
    description: "A cool, creamy yoghurt drink blended with sweet ripe mango and a hint of cardamom.",
    cuisine: "Indian", difficulty: "Easy", prep: 5, cook: 0, servings: 2, calories: 210,
    tags: "drink,mango,summer,no cook",
    ingredients: [
      [1, "cup", "ripe mango, chopped"], [1, "cup", "plain yoghurt"], [0.5, "cup", "cold milk"],
      [2, "tbsp", "sugar or honey"], [1, "pinch", "ground cardamom"], [4, "", "ice cubes"],
    ],
    steps: ["Add everything to a blender.", "Blend until smooth and frothy.", "Pour into chilled glasses and serve."],
  },
  {
    author: 3, category: "Main Course", title: "Vegetable Fried Rice",
    description: "Wok-tossed rice with crisp vegetables, egg and soy — the perfect use for yesterday's rice.",
    cuisine: "Chinese", difficulty: "Easy", prep: 10, cook: 10, servings: 3, calories: 380,
    tags: "rice,quick,vegetarian,leftovers",
    ingredients: [
      [3, "cups", "cooked rice, chilled"], [2, "", "eggs, beaten"], [1, "cup", "mixed vegetables (carrot, peas, beans)"],
      [3, "", "spring onions, sliced"], [2, "cloves", "garlic, minced"], [2, "tbsp", "soy sauce"],
      [1, "tsp", "sesame oil"], [2, "tbsp", "vegetable oil"],
    ],
    steps: [
      "Heat a wok until smoking, add half the oil and scramble the eggs. Remove and set aside.",
      "Add the remaining oil, garlic and vegetables and stir-fry for 2 minutes.",
      ["Add the rice, breaking up clumps, and fry until hot and slightly crisp.", 4],
      "Return the eggs, add soy sauce, sesame oil and spring onions. Toss and serve.",
    ],
  },
  {
    author: 2, category: "Desserts", title: "Watalappan",
    description: "A silky Sri Lankan steamed custard made with kithul jaggery, coconut milk and warm spices.",
    cuisine: "Sri Lankan", difficulty: "Medium", prep: 20, cook: 45, servings: 6, calories: 330,
    tags: "dessert,coconut,jaggery,traditional",
    ingredients: [
      [250, "g", "kithul jaggery, grated"], [400, "ml", "thick coconut milk"], [5, "", "eggs"],
      [0.5, "tsp", "ground cardamom"], [1, "pinch", "nutmeg"], [2, "tbsp", "cashews, chopped"],
    ],
    steps: [
      "Melt the jaggery with a splash of coconut milk over low heat, then cool.",
      "Beat the eggs lightly and mix in the jaggery syrup, remaining coconut milk and spices.",
      "Strain the mixture into a heat-proof dish and top with cashews.",
      ["Cover with foil and steam until just set with a slight wobble.", 45],
      "Cool, then chill before serving.",
    ],
  },
];

/** Populate an empty database with demo users, categories and recipes. */
export function seed(db: Database) {
  if ((db.get("SELECT COUNT(*) AS n FROM users") as { n: number }).n > 0) return;

  // Take the write lock first, then re-check, so two processes starting together can't both seed.
  db.exec("BEGIN IMMEDIATE");
  try {
    if ((db.get("SELECT COUNT(*) AS n FROM users") as { n: number }).n > 0) {
      db.exec("COMMIT");
      return;
    }
    for (const [name, emoji] of CATEGORIES) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      db.run("INSERT INTO categories (name, slug, emoji) VALUES (?, ?, ?)", [name, slug, emoji]);
    }

    for (const user of USERS) {
      db.run("INSERT INTO users (name, email, password_hash, role, bio) VALUES (?, ?, ?, ?, ?)", [
        user.name, user.email, bcrypt.hashSync(user.password, 10), user.role, user.bio,
      ]);
    }

    RECIPES.forEach((recipe, index) => {
      const category = db.get("SELECT id FROM categories WHERE name = ?", recipe.category) as { id: number };
      // Spread creation dates over the last few weeks so "latest" sorting looks natural.
      const createdAt = `datetime('now', '-${(RECIPES.length - index) * 2} days')`;
      const { lastInsertRowid } = db.run(
        `INSERT INTO recipes (user_id, category_id, title, description, cuisine, difficulty, prep_time, cook_time,
           servings, calories, tags, tips, is_featured, views, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${createdAt}, ${createdAt})`,
        [
          recipe.author, category.id, recipe.title, recipe.description, recipe.cuisine, recipe.difficulty,
          recipe.prep, recipe.cook, recipe.servings, recipe.calories, recipe.tags, recipe.tips ?? "",
          recipe.featured ? 1 : 0, 40 + ((index * 37) % 260),
        ],
      );
      const recipeId = Number(lastInsertRowid);
      recipe.ingredients.forEach(([quantity, unit, name], position) => {
        db.run("INSERT INTO ingredients (recipe_id, position, quantity, unit, name) VALUES (?, ?, ?, ?, ?)", [
          recipeId, position, quantity, unit, name,
        ]);
      });
      recipe.steps.forEach((step, position) => {
        const [instruction, timer] = typeof step === "string" ? [step, null] : step;
        db.run("INSERT INTO steps (recipe_id, position, instruction, timer_minutes) VALUES (?, ?, ?, ?)", [
          recipeId, position, instruction, timer,
        ]);
      });
    });

    const reviews: [recipe: number, user: number, rating: number, comment: string][] = [
      [1, 3, 5, "Made this for Sunday lunch — the family asked for seconds. That roasted curry powder makes all the difference!"],
      [1, 1, 4, "Lovely depth of flavour. I added a little extra chilli."],
      [2, 3, 5, "Simple, comforting and perfect with bread."],
      [3, 3, 5, "Brought back memories of Avurudu mornings."],
      [5, 2, 5, "Finally a carbonara without cream. Silky and delicious."],
      [5, 1, 4, "Great technique tips."],
      [6, 2, 4, "Fluffy as promised. Kids loved them."],
      [7, 2, 5, "Perfect lava centre at exactly 12 minutes."],
      [10, 2, 5, "Best banana bread I've baked."],
      [13, 3, 4, "Silky and not too sweet. Will make again."],
    ];
    for (const [recipeId, userId, rating, comment] of reviews) {
      db.run("INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", [recipeId, userId, rating, comment]);
    }

    for (const [userId, recipeId] of [[2, 5], [2, 7], [3, 1], [3, 3], [3, 13]]) {
      db.run("INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)", [userId, recipeId]);
    }
    db.run("INSERT INTO follows (follower_id, following_id) VALUES (2, 3), (3, 2)");

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
