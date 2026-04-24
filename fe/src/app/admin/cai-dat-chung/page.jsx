'use client'

import {useEffect} from "react";
import {usePageInfoStore} from "~/store/page-info";
import WorkspaceSettingsPanel from "~/app/admin/cai-dat-chung/WorkspaceSettingsPanel";

export default function CaiDatChung() {
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);

    useEffect(() => {
        setPageInfo({
            title: "Cài đặt chung"
        });
    }, [setPageInfo]);

    return <WorkspaceSettingsPanel />;
}
