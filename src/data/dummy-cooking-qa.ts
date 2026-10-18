// Canned hands-free cooking Q&A replies - demo/UI purposes only, stands
// in for the real cooking assistant (Gemini) until that integration is
// built. Cycles in order, same predictable-demo reasoning as
// dummy-recipes.ts.
const DUMMY_COOKING_REPLIES: string[] = [
  "Keep the heat on medium so it doesn't catch at the bottom.",
  "You can substitute that with whatever you have on hand - it won't change the result much.",
  "About five more minutes should do it. Look for it to turn golden brown.",
  "Yes, that's the right order - just make sure the pan is hot before you add it.",
  "Season with a pinch of salt now, then taste again once it's done.",
];

let replyIndex = 0;

export function getNextCookingReply(): string {
  const reply =
    DUMMY_COOKING_REPLIES[replyIndex % DUMMY_COOKING_REPLIES.length];
  replyIndex += 1;
  return reply;
}
