"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function SuperAdminLayout({children}) {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/cai-dat-chung");
    }, [router]);

    return children;
}
