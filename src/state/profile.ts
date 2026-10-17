import { create } from "zustand";

interface ProfileState {
  allergies: string[];
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
}

// Shared app-wide allergy profile. Seeded with the same dummy list the
// settings screen used ("Peanuts", "Gluten") - still not persisted to
// expo-secure-store, but now lives in one place so the settings UI and
// the ingredient check read/write the same list.
export const useProfileStore = create<ProfileState>((set) => ({
  allergies: ["Peanuts", "Gluten"],
  addAllergy: (allergy) =>
    set((state) =>
      state.allergies.includes(allergy)
        ? state
        : { allergies: [...state.allergies, allergy] }
    ),
  removeAllergy: (allergy) =>
    set((state) => ({
      allergies: state.allergies.filter((item) => item !== allergy),
    })),
}));
