import type { ChatMessage } from "@/types/chat";

export interface DummyChat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// Full past conversations for the History panel - dummy data only, so
// selecting one has something real to load until chats are actually
// persisted. Each has a couple of turns, not just one exchange, so the
// history feels like a real chat rather than a single Q&A.
export const DUMMY_CHATS: DummyChat[] = [
  {
    id: "1",
    title: "Garlic butter rice",
    messages: [
      { id: "1-1", role: "user", text: "I have rice, butter, and garlic." },
      {
        id: "1-2",
        role: "agent",
        text: "Garlic Butter Rice: melt butter with minced garlic, stir in cooked rice, season with salt and pepper. Ready in 10 minutes.",
      },
      { id: "1-3", role: "user", text: "Can I add some spring onion too?" },
      {
        id: "1-4",
        role: "agent",
        text: "Yes - stir in chopped spring onion right at the end, off the heat, so it stays fresh and crunchy.",
      },
    ],
  },
  {
    id: "2",
    title: "Quick veggie omelette",
    messages: [
      { id: "2-1", role: "user", text: "I have eggs, onion, and tomato." },
      {
        id: "2-2",
        role: "agent",
        text: "Simple Veggie Omelette: whisk 2 eggs, pour into a hot pan with chopped onion and tomato, fold once set. Serves 1.",
      },
      { id: "2-3", role: "user", text: "What if I don't have tomato?" },
      {
        id: "2-4",
        role: "agent",
        text: "No problem - just skip it, or swap in any vegetable you have, like chopped bell pepper or spinach.",
      },
    ],
  },
  {
    id: "3",
    title: "Tomato pasta with basil",
    messages: [
      {
        id: "3-1",
        role: "user",
        text: "I have pasta, tomatoes, garlic, and basil.",
      },
      {
        id: "3-2",
        role: "agent",
        text: "Tomato Pasta: boil pasta, sauté garlic in olive oil, add chopped tomatoes and simmer 10 minutes, toss with pasta and basil.",
      },
      { id: "3-3", role: "user", text: "How long should I simmer it?" },
      {
        id: "3-4",
        role: "agent",
        text: "About 10 minutes on medium-low heat, until the tomatoes break down into a light sauce.",
      },
    ],
  },
  {
    id: "4",
    title: "Quick lentil soup",
    messages: [
      {
        id: "4-1",
        role: "user",
        text: "I have lentils, onion, and carrot.",
      },
      {
        id: "4-2",
        role: "agent",
        text: "Quick Lentil Soup: simmer lentils with onion, carrot, and vegetable stock for 20 minutes, season to taste.",
      },
      { id: "4-3", role: "user", text: "Do I need to soak the lentils first?" },
      {
        id: "4-4",
        role: "agent",
        text: "Not for most red or split lentils - they cook fine straight into the pot in about 20 minutes.",
      },
    ],
  },
  {
    id: "5",
    title: "Leftover egg fried rice",
    messages: [
      {
        id: "5-1",
        role: "user",
        text: "I have leftover rice, an egg, and some peas.",
      },
      {
        id: "5-2",
        role: "agent",
        text: "Egg Fried Rice: scramble the egg in a hot pan, add rice and peas, stir-fry for 3-4 minutes with a splash of soy sauce.",
      },
      { id: "5-3", role: "user", text: "Any tips for making it less soggy?" },
      {
        id: "5-4",
        role: "agent",
        text: "Use cold, day-old rice if you can, and keep the pan hot with the egg cooked separately before mixing it back in.",
      },
    ],
  },
];
