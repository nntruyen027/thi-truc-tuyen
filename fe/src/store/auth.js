import {create} from "zustand";
import {persist} from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            access: null,
            refresh: null,

            setAuth: ({ user, access, refresh }) => {
                set({ user, access, refresh })
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("refresh", refresh);
                localStorage.setItem('access', access);
            },

            setUser: (user) =>
            {
                set((state) => ({ ...state, user }));
                localStorage.setItem("user", JSON.stringify(user));
            },


            clearAuth: () => {
                set({ user: null, access: null, refresh: null });

                if (typeof window !== "undefined") {
                    localStorage.removeItem("user");
                    localStorage.removeItem("refresh");
                    localStorage.removeItem("access");
                    localStorage.removeItem("auth-storage");
                }
            },

            isLoggedIn: () => !!get().access,
        }),
        {
            name: "auth-storage", // key trong localStorage
        }
    )
);
