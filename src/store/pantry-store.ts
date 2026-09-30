import { create } from "zustand";

export interface PantryItem {
  id: string;
  name: string;
}

interface PantryState {
  items: PantryItem[];
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
}

// In-memory only for now. Will move to expo-sqlite so the pantry
// survives an app restart once the data layer is built.
export const usePantryStore = create<PantryState>((set) => ({
  items: [],
  addItem: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => ({
      items: [...state.items, { id: Date.now().toString(), name: trimmed }],
    }));
  },
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));
