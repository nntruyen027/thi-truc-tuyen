'use client';

import {useEffect, useRef, useState} from "react";
import {layDotThi} from "~/services/thi/dot-thi";
import {useDebounce} from "~/hook/data";

export function useDotThiSelect(cuocThiId,{defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsDotThi, setDsDotThi] = useState([]);
    const [searchDotThi, setSearchDotThi] = useState("");
    const debouncedDotThi = useDebounce(searchDotThi, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        size: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsDotThi.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchDotThi = async ({reset = false} = {}) => {
        if (loading) return;
        if(!cuocThiId) {
            setDsDotThi([])
            setSearchDotThi("")
            return
        }

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedDotThi}_${page}_${pagi.size}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsDotThi(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layDotThi(cuocThiId,{
                page,
                size: pagi.limit,
                search: debouncedDotThi,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsDotThi(prev => reset ? list : [...prev, ...list]);
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
        fetchDotThi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cuocThiId]);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsDotThi([]);
        setPagi(p => ({...p, page: 1}));
        fetchDotThi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedDotThi]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchDotThi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsDotThi,
        loading,
        hasMore,
        setSearchDotThi,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}
