"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuthStore} from "~/store/auth";
import {getMe} from "~/services/auth";
import {isPublicPath, isTokenExpired} from "~/utils/auth";

export default function InnerLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const { setAuth, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            const isPublic = isPublicPath(pathname);

            const access = localStorage.getItem("access");
            const refresh = localStorage.getItem("refresh");
            const userLocal = localStorage.getItem("user");
            let parsedUser = null;

            if (userLocal) {
                try {
                    parsedUser = JSON.parse(userLocal);
                } catch {
                    parsedUser = null;
                }
            }

            if (!access || !userLocal || isTokenExpired(access)) {
                clearAuth();
                setIsAuthorized(isPublic);

                if (!isPublic) {
                    router.replace("/");
                }

                setLoading(false);
                return;
            }

            try {
                const me = await getMe();

                setAuth({
                    access,
                    user: me,
                    refresh
                });
                setIsAuthorized(true);

            } catch (error) {
                const status = error?.response?.status;

                if (status === 401 || !parsedUser) {
                    clearAuth();
                    setIsAuthorized(isPublic);

                    if (!isPublic) {
                        router.replace("/");
                    }
                } else {
                    setAuth({
                        access,
                        user: parsedUser,
                        refresh,
                    });
                    setIsAuthorized(true);
                }
            }

            setLoading(false);
        };

        void initAuth();
    }, [clearAuth, pathname, router, setAuth]);

    if (loading || !isAuthorized) return null;

    return <>{children}</>;
}
