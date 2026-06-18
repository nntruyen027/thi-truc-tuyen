'use client';

import {
    layBangXepHangCongKhai,
    layKetQuaCacDotThiCongKhai,
} from "~/services/thi/thi";

const CACHE_TTL_MS = 120 * 1000;
const PUBLIC_RANKING_TOP = 20;
const PUBLIC_HONOR_TOP = 200;

const cacheStore = new Map();
const inflightStore = new Map();

function hasDotThiResultsBundle(bundle) {
    return Boolean(bundle)
        && Object.prototype.hasOwnProperty.call(bundle, "dotThiResults")
        && bundle.dotThiResults
        && typeof bundle.dotThiResults === "object";
}

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
        "bundle",
        Number(dotThiId || 0),
        Number(cuocThiId || 0),
        Number(rankingTop || 0),
        Number(honorTop || 0),
    ].join(":");
}

function getDotThiResultsKey(dotThiId, cuocThiId) {
    return [
        "dot-thi-results",
        Number(dotThiId || 0),
        Number(cuocThiId || 0),
    ].join(":");
}

function readCache(key) {
    const entry = cacheStore.get(key);
    return isFresh(entry) ? entry.data : null;
}

async function loadBundle(
    type,
    dotThiId,
    cuocThiId,
    rankingTop = PUBLIC_RANKING_TOP,
    honorTop = PUBLIC_HONOR_TOP
) {
    const key =
        type === "dot-thi-results"
            ? getDotThiResultsKey(dotThiId, cuocThiId)
            : getBundleKey(dotThiId, cuocThiId, rankingTop, honorTop);
    const cached = readCache(key);

    if (cached && (type !== "dot-thi-results" || typeof cached === "object")) {
        return cached;
    }

    if (inflightStore.has(key)) {
        return inflightStore.get(key);
    }

    const request = (async () => {
        const data =
            type === "dot-thi-results"
                ? await layKetQuaCacDotThiCongKhai({
                    dotThiId,
                    cuocThiId,
                })
                : await layBangXepHangCongKhai({
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
    if (type === "dot-thi-results") {
        const bundle = readCache(
            getDotThiResultsKey(dotThiId, cuocThiId)
        );

        return hasDotThiResultsBundle(bundle) ? bundle.dotThiResults : (bundle || null);
    }

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
        type,
        dotThiId,
        cuocThiId,
        PUBLIC_RANKING_TOP,
        PUBLIC_HONOR_TOP
    ).then((bundle) => {
        if (type === "dot-thi-results") {
            return hasDotThiResultsBundle(bundle)
                ? (bundle?.dotThiResults || {})
                : (bundle || {});
        }

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
