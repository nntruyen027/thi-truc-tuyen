import {create} from "zustand";
import {normalizePrimaryColor} from "~/utils/workspaceTheme";

export const useWorkspaceThemeStore = create((set) => ({
    primaryColor: normalizePrimaryColor(),
    setPrimaryColor: (primaryColor) => set({
        primaryColor: normalizePrimaryColor(primaryColor),
    }),
}));
