"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuthStore} from "~/store/auth";
import {getMe} from "~/services/auth";
import {isPublicPath, isTokenExpired} from "~/utils/auth";

export default function InnerLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const { user, setAuth, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const isPublic = isPublicPath(pathname);

            const access = localStorage.getItem("access");
            const refresh = localStorage.getItem("refresh");
            const userLocal = localStorage.getItem("user");

            if (!access || !userLocal || isTokenExpired(access)) {
                clearAuth();

                if (!isPublic) {
                    router.replace("/");
                }

                setLoading(false);
                return;
            }

            if (!user) {
                try {
                    const me = await getMe();

                    setAuth({
                        access,
                        user: me,
                        refresh
                    });

                } catch (e) {

                    clearAuth();

                    if (!isPublic) {
                        router.replace("/");
                    }
                }
            }

            setLoading(false);
        };

        void initAuth();
    }, [clearAuth, pathname, router, setAuth, user]);

    if (loading) return null;

    return <>{children}</>;
}
