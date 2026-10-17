// Deterministic ingredient-vs-allergy matching. This is plain code, not
// an AI judgement - per the safety rule, the AI may generate content but
// this check decides what is flagged/excluded.

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/(e)?s$/, "");

export function isAllergen(ingredient: string, allergies: string[]): boolean {
  const ing = normalize(ingredient);
  if (!ing) return false;
  return allergies.some((allergy) => {
    const al = normalize(allergy);
    return al.length > 0 && (ing.includes(al) || al.includes(ing));
  });
}
