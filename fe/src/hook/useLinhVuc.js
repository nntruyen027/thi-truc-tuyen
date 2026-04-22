'use client';

import {useEffect, useRef, useState} from "react";
import {layLinhVuc} from "~/services/dm_chung/linh_vuc";
import {useDebounce} from "~/hook/data";

export function useLinhVucSelect({defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsLinhVuc, setDsLinhVuc] = useState([]);
    const [searchLinhVuc, setSearchLinhVuc] = useState("");
    const debouncedLinhVuc = useDebounce(searchLinhVuc, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        size: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsLinhVuc.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchLinhVuc = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedLinhVuc}_${page}_${pagi.size}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsLinhVuc(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layLinhVuc({
                page,
                size: pagi.limit,
                search: debouncedLinhVuc,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsLinhVuc(prev => reset ? list : [...prev, ...list]);
            setPagi(p => ({
                ...p,
                page,
                total: res?.total || 0,
            }));
        } finally {
            setLoading(false);
        }
    };

    /* ===================== EFFECT ===================== */

    // 🔥 FETCH LẦN ĐẦU KHI MOUNT (QUAN TRỌNG)
    useEffect(() => {
        fetchLinhVuc({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsLinhVuc([]);
        setPagi(p => ({...p, page: 1}));
        fetchLinhVuc({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedLinhVuc]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchLinhVuc();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsLinhVuc,
        loading,
        hasMore,
        setSearchLinhVuc,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}
