export interface IngredientEntry {
  id: string;
  name: string;
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  description: string;
  optionalExtras: string[];
}

export type ChatMessageKind = "text" | "ingredients" | "recipes";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  imageUri?: string;
  // Card messages posted by the agent: "ingredients" renders the
  // editable confirmation list, "recipes" renders the suggestion tiles.
  kind?: ChatMessageKind;
  ingredients?: IngredientEntry[];
  confirmed?: boolean;
  // Set when the user sends more ingredients while a review card is
  // still open - the card freezes and its items move back to pending.
  superseded?: boolean;
  recipes?: RecipeSuggestion[];
  // Confirmed ingredient names a recipes message was built from - the
  // tile card uses this to flag optional extras the user is missing.
  basedOn?: string[];
}
