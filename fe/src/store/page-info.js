import {create} from "zustand";
import {persist} from "zustand/middleware";

export const usePageInfoStore = create(
    persist(
        (set, get) => ({
            // ---------------------
            // STATE
            // ---------------------
            title: "",
            currentPath: "",
            previousPath: "",
            previousTitle: "",

            // ---------------------
            // ACTIONS
            // ---------------------
            setPageInfo: ({title, path}) => {
                const {currentPath, title: currentTitle} = get();

                set({
                    title,
                    currentPath: path,
                    previousPath: currentPath,
                    previousTitle: currentTitle,
                });
            },

            clearPageInfo: () =>
                set({
                    title: "",
                    currentPath: "",
                    previousPath: "",
                    previousTitle: "",
                }),

            // ---------------------
            // HELPERS
            // ---------------------
            canGoBack: () => !!get().previousPath,
        }),
        {
            name: "page-info-storage",
            partialize: (state) => ({
                title: state.title,
                currentPath: state.currentPath,
                previousPath: state.previousPath,
                previousTitle: state.previousTitle,
            }),
        }
    )
);
