'use client';

import {useEffect, useRef, useState} from "react";
import {layNhomCauHoi} from "~/services/dm_chung/nhom_cau_hoi";
import {useDebounce} from "~/hook/data";

export function useNhomCauHoiSelect({defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsNhomCauHoi, setDsNhomCauHoi] = useState([]);
    const [searchNhomCauHoi, setSearchNhomCauHoi] = useState("");
    const debouncedNhomCauHoi = useDebounce(searchNhomCauHoi, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        size: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsNhomCauHoi.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchNhomCauHoi = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedNhomCauHoi}_${page}_${pagi.size}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsNhomCauHoi(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layNhomCauHoi({
                page,
                size: pagi.size,
                search: debouncedNhomCauHoi,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsNhomCauHoi(prev => reset ? list : [...prev, ...list]);
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
        fetchNhomCauHoi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsNhomCauHoi([]);
        setPagi(p => ({...p, page: 1}));
        fetchNhomCauHoi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedNhomCauHoi]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchNhomCauHoi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsNhomCauHoi,
        loading,
        hasMore,
        setSearchNhomCauHoi,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}
