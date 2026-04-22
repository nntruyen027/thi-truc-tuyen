'use client';

import {useEffect, useRef, useState} from "react";
import {getDonVi} from "~/services/dm_chung/don_vi";
import {useDebounce} from "~/hook/data";

export function useDonViSelect({defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsDonVi, setDsDonVi] = useState([]);
    const [searchDonVi, setSearchDonVi] = useState("");
    const debouncedDonVi = useDebounce(searchDonVi, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        size: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsDonVi.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchDonVi = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedDonVi}_${page}_${pagi.size}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsDonVi(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await getDonVi({
                page,
                size: pagi.size,
                search: debouncedDonVi,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsDonVi(prev => reset ? list : [...prev, ...list]);
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
        fetchDonVi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsDonVi([]);
        setPagi(p => ({...p, page: 1}));
        fetchDonVi({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedDonVi]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchDonVi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsDonVi,
        loading,
        hasMore,
        setSearchDonVi,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}
