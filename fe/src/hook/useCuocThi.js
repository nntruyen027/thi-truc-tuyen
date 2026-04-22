'use client';

import {useEffect, useRef, useState} from "react";
import {layCuocThi} from "~/services/thi/cuoc-thi";
import {useDebounce} from "~/hook/data";

export function useCuocThiSelect({defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsCuocThi, setDsCuocThi] = useState([]);
    const [searchCuocThi, setSearchCuocThi] = useState("");
    const debouncedCuocThi = useDebounce(searchCuocThi, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        size: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsCuocThi.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchCuocThi = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedCuocThi}_${page}_${pagi.size}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsCuocThi(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layCuocThi({
                page,
                size: pagi.limit,
                search: debouncedCuocThi,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsCuocThi(prev => reset ? list : [...prev, ...list]);
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
        fetchCuocThi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsCuocThi([]);
        setPagi(p => ({...p, page: 1}));
        fetchCuocThi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedCuocThi]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchCuocThi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsCuocThi,
        loading,
        hasMore,
        setSearchCuocThi,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}
