import {create} from "zustand";
import {normalizePrimaryColor} from "~/utils/workspaceTheme";

export const useWorkspaceThemeStore = create((set) => ({
    workspace: null,
    primaryColor: normalizePrimaryColor(),
    setWorkspace: (workspace) => set({workspace: workspace || null}),
    setPrimaryColor: (primaryColor) => set({
        primaryColor: normalizePrimaryColor(primaryColor),
    }),
}));
