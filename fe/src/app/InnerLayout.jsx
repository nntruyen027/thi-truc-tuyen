"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuthStore} from "~/store/auth";
import {getMe} from "~/services/auth";
import {isPublicPath, isTokenExpired} from "~/utils/auth";

const AUTH_ME_CACHE_MS = 5 * 60 * 1000;

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
                const shouldReuseLocalUser =
                    !!parsedUser
                    && (isPublic || (() => {
                        try {
                            const lastCheckedAt = Number(sessionStorage.getItem("auth_me_checked_at") || 0);
                            return Number.isFinite(lastCheckedAt)
                                && (Date.now() - lastCheckedAt) < AUTH_ME_CACHE_MS;
                        } catch {
                            return false;
                        }
                    })());

                if (shouldReuseLocalUser) {
                    setAuth({
                        access,
                        user: parsedUser,
                        refresh,
                    });
                    setIsAuthorized(true);
                    setLoading(false);
                    return;
                }

                const me = await getMe();

                try {
                    sessionStorage.setItem("auth_me_checked_at", String(Date.now()));
                } catch {
                    // Ignore storage issues on restricted browsers.
                }

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
                    try {
                        sessionStorage.setItem("auth_me_checked_at", String(Date.now()));
                    } catch {
                        // Ignore storage issues on restricted browsers.
                    }

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
