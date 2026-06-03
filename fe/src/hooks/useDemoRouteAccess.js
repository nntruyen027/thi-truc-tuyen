'use client';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

import {layCauHinhTrangChu} from "~/services/trang-chu";
import {layDuongDanTrangChu} from "~/utils/trang-chu";

export default function useDemoRouteAccess(currentDemo, skipCheck = false) {
    const router = useRouter();
    const [canRender, setCanRender] = useState(skipCheck);

    useEffect(() => {
        if (skipCheck) {
            return undefined;
        }

        let active = true;

        const load = async () => {
            try {
                const res = await layCauHinhTrangChu();
                const settings = res.data;

                if (!settings.showAllDemos && settings.selectedDemo !== currentDemo) {
                    router.replace(layDuongDanTrangChu(settings.selectedDemo));
                    return;
                }

                if (active) {
                    setCanRender(true);
                }
            } catch {
                if (active) {
                    setCanRender(true);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [currentDemo, router, skipCheck]);

    return canRender;
}
