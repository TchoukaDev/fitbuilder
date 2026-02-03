import { create } from "zustand";

interface UnsavedStore {
    hasUnsavedChanges: boolean,
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void,
}

export const useUnsavedStore = create<UnsavedStore>((set) => ({
    hasUnsavedChanges: false,
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => set({ hasUnsavedChanges }),
}))
