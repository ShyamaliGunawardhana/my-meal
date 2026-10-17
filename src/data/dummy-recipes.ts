// Canned recipe data for demo/UI purposes only - not real recipe
// matching or AI generation. Replace once the actual matching engine
// and Gemini integration are built.
export interface DummyRecipe {
  title: string;
  description: string;
  // Core items the recipe needs - matched against the user's confirmed
  // ingredient list when ranking suggestions.
  ingredients: string[];
  // Non-mandatory extras. If the user's list doesn't include them the
  // tile shows them as "nice to have", never as blockers.
  optionalExtras: string[];
}

export const DUMMY_RECIPES: DummyRecipe[] = [
  {
    title: "Garlic Butter Rice",
    description:
      "Melt butter with minced garlic, stir in cooked rice, season with salt and pepper. Ready in 10 minutes.",
    ingredients: ["rice", "butter", "garlic"],
    optionalExtras: ["salt", "pepper", "spring onion"],
  },
  {
    title: "Simple Veggie Omelette",
    description:
      "Whisk 2 eggs, pour into a hot pan with chopped onion and tomato, fold once set. Serves 1.",
    ingredients: ["eggs", "onion", "tomato"],
    optionalExtras: ["cheese", "bell pepper", "salt", "pepper"],
  },
  {
    title: "Tomato Pasta",
    description:
      "Boil pasta, sauté garlic in olive oil, add chopped tomatoes and simmer 10 minutes, toss with pasta and basil.",
    ingredients: ["pasta", "tomatoes", "garlic", "basil"],
    optionalExtras: ["olive oil", "parmesan", "chili flakes"],
  },
  {
    title: "Quick Lentil Soup",
    description:
      "Simmer lentils with onion, carrot, and vegetable stock for 20 minutes, season to taste.",
    ingredients: ["lentils", "onion", "carrot"],
    optionalExtras: ["vegetable stock", "cumin", "lemon"],
  },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/(e)?s$/, "");

// Ranks canned recipes by how many of the confirmed ingredients they
// use (most matches first = the "proper order" shown as numbered
// tiles). Falls back to the whole list so a suggestion is always
// produced. Stands in for the real matcher until it exists.
export function suggestRecipes(ingredients: string[]): DummyRecipe[] {
  const names = ingredients.map(normalize).filter(Boolean);
  const scored = DUMMY_RECIPES.map((recipe) => ({
    recipe,
    matches: recipe.ingredients.filter((needed) =>
      names.some((name) => needed.toLowerCase().includes(name))
    ).length,
  }))
    .filter((entry) => entry.matches > 0)
    .sort((a, b) => b.matches - a.matches);

  return scored.length > 0 ? scored.map((e) => e.recipe) : DUMMY_RECIPES;
}
