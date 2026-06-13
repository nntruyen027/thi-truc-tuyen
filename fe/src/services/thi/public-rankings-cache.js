'use client';

import {
    layBangXepHangCongKhai,
} from "~/services/thi/thi";

const CACHE_TTL_MS = 120 * 1000;
const PUBLIC_RANKING_TOP = 20;
const PUBLIC_HONOR_TOP = 200;

const cacheStore = new Map();
const inflightStore = new Map();

function isFresh(entry) {
    return entry && (Date.now() - entry.createdAt) < CACHE_TTL_MS;
}

function getBundleKey(
    dotThiId,
    cuocThiId,
    rankingTop = PUBLIC_RANKING_TOP,
    honorTop = PUBLIC_HONOR_TOP
) {
    return [
        Number(dotThiId || 0),
        Number(cuocThiId || 0),
        Number(rankingTop || 0),
        Number(honorTop || 0),
    ].join(":");
}

function readCache(key) {
    const entry = cacheStore.get(key);
    return isFresh(entry) ? entry.data : null;
}

async function loadBundle(
    dotThiId,
    cuocThiId,
    rankingTop = PUBLIC_RANKING_TOP,
    honorTop = PUBLIC_HONOR_TOP
) {
    const key = getBundleKey(dotThiId, cuocThiId, rankingTop, honorTop);
    const cached = readCache(key);

    if (cached) {
        return cached;
    }

    if (inflightStore.has(key)) {
        return inflightStore.get(key);
    }

    const request = (async () => {
        const data =
            await layBangXepHangCongKhai({
                dotThiId,
                cuocThiId,
                rankingTop,
                honorTop,
            });

        cacheStore.set(key, {
            createdAt: Date.now(),
            data,
        });

        return data;
    })();

    inflightStore.set(key, request);

    try {
        return await request;
    } finally {
        inflightStore.delete(key);
    }
}

export function getCachedPublicRankings(type, dotThiId, cuocThiId, top) {
    const bundle = readCache(
        getBundleKey(
            dotThiId,
            cuocThiId,
            PUBLIC_RANKING_TOP,
            PUBLIC_HONOR_TOP
        )
    );
    const bucket =
        type === "honor-board"
            ? bundle?.honorBoard
            : bundle?.rankings;

    if (!bucket) {
        return null;
    }

    if (type === "honor-board") {
        return {
            "dot-thi": bucket?.["dot-thi"] || {},
            "cuoc-thi": bucket?.["cuoc-thi"] || {},
        };
    }

    return {
        "dot-thi": bucket["dot-thi"] || [],
        "cuoc-thi": bucket["cuoc-thi"] || [],
    };
}

export function loadPublicRankings(type, dotThiId, cuocThiId, top) {
    return loadBundle(
        dotThiId,
        cuocThiId,
        PUBLIC_RANKING_TOP,
        PUBLIC_HONOR_TOP
    ).then((bundle) => {
        const bucket =
            type === "honor-board"
                ? bundle?.honorBoard
                : bundle?.rankings;

        if (type === "honor-board") {
            return {
                "dot-thi": bucket?.["dot-thi"] || {},
                "cuoc-thi": bucket?.["cuoc-thi"] || {},
            };
        }

        return {
            "dot-thi": bucket?.["dot-thi"] || [],
            "cuoc-thi": bucket?.["cuoc-thi"] || [],
        };
    });
}
