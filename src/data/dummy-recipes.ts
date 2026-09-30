// Canned replies for demo/UI purposes only - not real recipe matching or
// AI generation. Replace once the actual matching engine and Gemini
// integration are built.
export const DUMMY_RECIPE_REPLIES: string[] = [
  "Garlic Butter Rice: melt butter with minced garlic, stir in cooked rice, season with salt and pepper. Ready in 10 minutes.",
  "Simple Veggie Omelette: whisk 2 eggs, pour into a hot pan with chopped onion and tomato, fold once set. Serves 1.",
  "Tomato Pasta: boil pasta, sauté garlic in olive oil, add chopped tomatoes and simmer 10 minutes, toss with pasta and basil.",
  "Quick Lentil Soup: simmer lentils with onion, carrot, and vegetable stock for 20 minutes, season to taste.",
];

let replyIndex = 0;

// Cycles through the canned replies in order rather than randomly, so
// behaviour is predictable while demoing.
export function getNextDummyReply(): string {
  const reply = DUMMY_RECIPE_REPLIES[replyIndex % DUMMY_RECIPE_REPLIES.length];
  replyIndex += 1;
  return reply;
}
