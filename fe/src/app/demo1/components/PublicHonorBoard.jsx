'use client';

import {useEffect, useMemo, useState} from "react";
import {Card, Empty, Segmented, Spin, Typography} from "antd";
import {SwapOutlined, TrophyFilled} from "@ant-design/icons";

import Reveal from "~/app/components/common/Reveal";
import {alphaColor} from "~/utils/workspaceTheme";
import {getCachedPublicRankings, loadPublicRankings} from "~/services/thi/public-rankings-cache";

const {Text} = Typography;
const HONOR_BOARD_LIMIT = 5;
const HONOR_BOARD_MODES = {
    attempts: "luot-thi",
    participants: "nguoi-tham-gia",
};

function getTenDonVi(record) {
    return record?.tenDonVi || record?.ten_don_vi || "-";
}

function getSoLuongThiSinh(record) {
    return record?.soLuongThiSinh ?? record?.so_luong_thi_sinh ?? 0;
}

function getSoNguoiThamGia(record) {
    return record?.soNguoiThamGia ?? record?.so_nguoi_tham_gia ?? 0;
}

function getSoDangVienThamGia(record) {
    return record?.soDangVienThamGia ?? record?.so_dang_vien_tham_gia ?? null;
}

function getHonorBoardRows(bundle, scope, mode) {
    const scopeData = bundle?.[scope];

    if (Array.isArray(scopeData)) {
        return scopeData;
    }

    return scopeData?.[mode] || [];
}

const MEDAL_STYLES = [
    {
        bg: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)",
        color: "#7c2d12",
    },
    {
        bg: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
        color: "#334155",
    },
    {
        bg: "linear-gradient(135deg, #fed7aa 0%, #f97316 100%)",
        color: "#7c2d12",
    },
];

export default function PublicHonorBoard({dotThi, colorPrimary, deepPrimary, demoData = null}) {
    const [scope, setScope] = useState("dot-thi");
    const [mode, setMode] = useState(HONOR_BOARD_MODES.attempts);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const choPhepCongBo =
        !!dotThi?.cuoc_thi?.cho_phep_xem_lich_su;

    useEffect(() => {
        if (demoData) {
            setData(getHonorBoardRows(demoData, scope, mode));
            setLoading(false);
            return undefined;
        }

        if (!dotThi?.id || !choPhepCongBo) {
            setData([]);
            return;
        }

        let active = true;
        const cached = getCachedPublicRankings("honor-board", dotThi.id, dotThi.cuoc_thi_id, HONOR_BOARD_LIMIT);

        if (cached) {
            setData(getHonorBoardRows(cached, scope, mode));
            setLoading(false);
        } else {
            setLoading(true);
        }

        const load = async () => {
            try {
                const res = await loadPublicRankings(
                    "honor-board",
                    dotThi.id,
                    dotThi.cuoc_thi_id,
                    HONOR_BOARD_LIMIT
                );

                if (active) {
                    setData(getHonorBoardRows(res, scope, mode));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [choPhepCongBo, demoData, dotThi?.cuoc_thi_id, dotThi?.id, mode, scope]);

    const rows = useMemo(() => data.slice(0, HONOR_BOARD_LIMIT), [data]);
    const laCheDoLuotThi = mode === HONOR_BOARD_MODES.attempts;
    const title = laCheDoLuotThi
        ? "Đơn vị có nhiều lượt thi"
        : "Đơn vị có nhiều người tham gia";
    const nextLabel = laCheDoLuotThi
        ? "Xem người tham gia"
        : "Xem lượt thi";

    return (
        <Reveal delay={95} className="h-full w-full">
            <Card
                className="h-full overflow-hidden rounded-[28px] border shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
                style={{borderColor: alphaColor(colorPrimary, 0.14)}}
                styles={{body: {padding: 0, height: "100%"}}}
            >
                <div className="h-full" style={{background: alphaColor(colorPrimary, 0.05)}}>
                    <button
                        type="button"
                        onClick={() => {
                            setMode((current) => (
                                current === HONOR_BOARD_MODES.attempts
                                    ? HONOR_BOARD_MODES.participants
                                    : HONOR_BOARD_MODES.attempts
                            ));
                        }}
                        style={{
                            background: deepPrimary || colorPrimary,
                            margin: 0,
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-white transition-opacity hover:opacity-95"
                    >
                        <span className="min-w-0 text-sm font-semibold uppercase tracking-[0.12em] md:text-base">
                            {title}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] md:text-xs">
                            <SwapOutlined />
                            {nextLabel}
                        </span>
                    </button>

                    <div className="flex h-full flex-col px-4 py-4 md:px-5 md:py-5">
                        {choPhepCongBo ? (
                            <div className="mb-3 flex justify-center">
                                <Segmented
                                    size="small"
                                    value={scope}
                                    onChange={setScope}
                                    options={[
                                        {label: "Theo đợt", value: "dot-thi"},
                                        {label: "Toàn cuộc thi", value: "cuoc-thi"},
                                    ]}
                                />
                            </div>
                        ) : null}

                        {!choPhepCongBo ? (
                            <div className="flex min-h-[18rem] items-center justify-center">
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa mở bảng xếp hạng" />
                            </div>
                        ) : loading ? (
                            <div className="flex min-h-[18rem] items-center justify-center">
                                <Spin size="large" />
                            </div>
                        ) : !rows.length ? (
                            <div className="flex min-h-[18rem] items-center justify-center">
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu xếp hạng" />
                            </div>
                        ) : (
                            <div className="space-y-3 pb-1">
                                {rows.map((item, index) => {
                                    const giaTri = laCheDoLuotThi
                                        ? getSoLuongThiSinh(item)
                                        : getSoNguoiThamGia(item);
                                    const soDangVienThamGia = getSoDangVienThamGia(item);
                                    const medalStyle =
                                        MEDAL_STYLES[index] || {
                                            bg: alphaColor(colorPrimary, 0.12),
                                            color: colorPrimary,
                                        };

                                    return (
                                        <div
                                            key={`${item?.donViId || item?.don_vi_id || "don-vi"}-${index}`}
                                            className="flex items-center gap-3 rounded-[22px] border bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                                            style={{borderColor: alphaColor(colorPrimary, 0.1)}}
                                        >
                                            <div
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold"
                                                style={{
                                                    background: medalStyle.bg,
                                                    color: medalStyle.color,
                                                }}
                                            >
                                                {index < 3 ? <TrophyFilled /> : index + 1}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[1.05rem] font-bold leading-6 text-slate-900">
                                                    {getTenDonVi(item)}
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right leading-none">
                                                <Text className="!block !text-[11px] !font-semibold !uppercase !tracking-[0.14em] !text-slate-400">
                                                    {laCheDoLuotThi ? "Lượt thi" : "Tham gia"}
                                                </Text>
                                                <div className="mt-1 text-[1.75rem] font-bold leading-none" style={{color: colorPrimary}}>
                                                    {Intl.NumberFormat("vi-VN").format(giaTri)}
                                                </div>
                                                {!laCheDoLuotThi && Number.isFinite(soDangVienThamGia) ? (
                                                    <div className="mt-1 text-[0.82rem] font-medium leading-none text-slate-400">
                                                        Đảng viên: {Intl.NumberFormat("vi-VN").format(soDangVienThamGia)}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Reveal>
    );
}
