'use client'

import {useCallback, useEffect, useState} from "react";
import {App, Button, Col, Row, Select, Table, Typography} from "antd";
import {usePageInfoStore} from "~/store/page-info";
import {
    xepHangTracNghiemTheoCuocThi,
    xepHangTracNghiemTheoDotThi,
    xuatKetQuaTracNghiemExcel
} from "~/services/thi/thi";
import {useCuocThiSelect} from "~/hook/useCuocThi";
import {useDotThiSelect} from "~/hook/useDotThi";
import {DownloadOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";

function getThiSinh(record) {
    return record?.thiSinh || record?.thi_sinh || null;
}

function getDiaChiThiSinh(record) {
    const thiSinh = getThiSinh(record) || {};
    const parts = [
        thiSinh?.diaChiDong1 || thiSinh?.dia_chi_dong_1,
        thiSinh?.xaPhuong || thiSinh?.xa_phuong,
        thiSinh?.tinhThanh || thiSinh?.tinh_thanh,
    ]
        .map((item) => String(item || "").trim())
        .filter(Boolean);

    return parts.join(", ");
}

function getBaiThiId(record) {
    return record?.baiThiId || record?.bai_thi_id || null;
}

function getSoLuotThi(record) {
    return record?.soLuotThi ?? record?.so_luot_thi ?? null;
}

function getThoiGian(record) {
    return record?.thoiGian ?? record?.thoi_gian ?? null;
}

function getSoDuDoan(record) {
    return record?.soDuDoan ?? record?.so_du_doan ?? 0;
}

function getSaiSo(record) {
    return record?.saiSo ?? record?.sai_so ?? 0;
}

function getKetQuaDuDoan(record) {
    return record?.soNguoi100 ?? record?.so_nguoi_100 ?? 0;
}

function getThoiGianThi(record) {
    return record?.thoiGianThi ?? record?.thoi_gian_thi ?? null;
}

function formatDuration(seconds) {
    const normalized = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(normalized / 60);
    const secs = normalized % 60;

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}


export default function NhomCauHoi() {
    const {Text} = Typography;

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cuocThi, setCuocThi] = useState(null);
    const [dotThi, setDotThi] = useState(null);
    const [top, setTop] = useState(10);
    const [selectedCuocThi, setSelectedCuocThi] = useState(null);
    const [selectedDotThi, setSelectedDotThi] = useState(null);
    const [selectedTop, setSelectedTop] = useState(10);
    const [exporting, setExporting] = useState(false);

    const { dsCuocThi, loading: cuocThiLoading, setSearchCuocThi, loadMore: cuocThiLoadMore } = useCuocThiSelect();
    const { dsDotThi, loading: dotThiLoading, setSearchDotThi, loadMore: dotThiLoadMore } = useDotThiSelect(selectedCuocThi);

    // ===== fetch =====

    const fetchData = useCallback(async (nextDotThi = dotThi, nextTop = top) => {

        setLoading(true);

        try {

            const res = await xepHangTracNghiemTheoDotThi(nextDotThi, nextTop);

            setData(res || []);



        } catch (e) {

            message.error(e.message);

        } finally {

            setLoading(false);

        }

    }, [dotThi, message, top]);

    const fetchDataCuocThi = useCallback(async (nextCuocThi = cuocThi, nextTop = top) => {

        setLoading(true);

        try {

            const res = await xepHangTracNghiemTheoCuocThi(nextCuocThi, nextTop);

            setData(res || []);



        } catch (e) {

            message.error(e.message);

        } finally {

            setLoading(false);

        }

    }, [cuocThi, message, top]);

    useEffect(() => {
        if (!selectedCuocThi) {
            setSelectedDotThi(null);
        }
    }, [selectedCuocThi]);

    const handleSearch = async () => {
        if (!selectedCuocThi && !selectedDotThi) {
            setCuocThi(null);
            setDotThi(null);
            setTop(selectedTop);
            setData([]);
            return;
        }

        setCuocThi(selectedCuocThi);
        setDotThi(selectedDotThi);
        setTop(selectedTop);

        if (selectedDotThi) {
            await fetchData(selectedDotThi, selectedTop);
            return;
        }

        await fetchDataCuocThi(selectedCuocThi, selectedTop);
    };

    const handleRefresh = async () => {
        if (!dotThi && !cuocThi) {
            setData([]);
            return;
        }

        if (dotThi) {
            await fetchData(dotThi, top);
            return;
        }

        await fetchDataCuocThi(cuocThi, top);
    };

    const handleExportExcel = async () => {
        if (!cuocThi && !dotThi) {
            message.warning("Vui lòng chọn cuộc thi hoặc đợt thi trước khi xuất Excel.");
            return;
        }

        setExporting(true);

        try {
            const blob = await xuatKetQuaTracNghiemExcel({
                cuocThiId: cuocThi,
                dotThiId: dotThi,
                top,
            });
            const scope = dotThi ? `dot-thi-${dotThi}` : `cuoc-thi-${cuocThi}`;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `ket-qua-trac-nghiem-${scope}-top-${top}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            message.error(e.message);
        } finally {
            setExporting(false);
        }
    };


    // ===== first load =====

    useEffect(() => {
        setPageInfo({
            title: "Kết quả thi trắc nghiệm"
        });

    }, [setPageInfo]);



    // ===== columns =====

    const columns = [

        {
            title: "#",
            width: 60,
            align: "right",
             
            render: (_, __, index) => {
                const top = index +
                    1;

                if (top === 1)
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={'/medal-1.png'} alt="Giải nhất" />
                else if (top === 2)
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={'/medal-2.png'} alt={'Giải nhì'} />
                else if (top === 3)
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={'/medal-3.png'} alt={'Giải ba'} />
                else
                    return top;
            }

        },

        {
            title: "Thí sinh",
            width: 220,
            ellipsis: true,
            render: (_, record) => getThiSinh(record)?.hoTen || getThiSinh(record)?.ho_ten || "-"
        },
        {
            title: "Số điện thoại",
            width: 160,
            ellipsis: true,
            render: (_, record) => getThiSinh(record)?.username || "-"
        },
        {
            title: "Địa chỉ",
            width: 320,
            ellipsis: true,
            render: (_, record) => getDiaChiThiSinh(record) || "-"
        },
        {
            title: "Đơn vị",
            width: 220,
            ellipsis: true,
            render: (_, record) =>
                getThiSinh(record)?.donViTen
                || getThiSinh(record)?.don_vi_ten
                || getThiSinh(record)?.don_vi?.ten
                || "-"
        },
        {
            title: "Điểm",
            dataIndex: "diem",
            width: 100,
            align: "center",
        },
        {
            title: "Số lượt thi",
            width: 120,
            align: "center",
            render: (_, record) => getSoLuotThi(record) ?? "-"
        },
        {
            title: "Thời gian làm bài",
            dataIndex: "thoi-gian-lam-bai",
            width: 160,
            align: "center",
            render: (_, record) => {
                const thoiGian = getThoiGian(record);
                const dotThiSelected = dsDotThi.find((item) => item.id === dotThi);
                const gioiHanTheoDotThi =
                    dotThiSelected?.thoi_gian_thi != null
                        ? Number(dotThiSelected.thoi_gian_thi) * 60
                        : null;
                const gioiHanTheoBanGhi =
                    getThoiGianThi(record) != null
                        ? Number(getThoiGianThi(record)) * 60
                        : null;
                const gioiHan = gioiHanTheoDotThi ?? gioiHanTheoBanGhi;

                if (thoiGian == null)
                    return "-"

                const diff =
                    gioiHan != null
                        ? Math.min(gioiHan, Number(thoiGian) || 0)
                        : Number(thoiGian) || 0

                return formatDuration(diff)

            }
        },
        {
            title: "Số dự đoán",
            width: 140,
            align: "center",
            render: (_, record) => getSoDuDoan(record)
        },
        {
            title: "Kết quả dự đoán",
            width: 180,
            align: "center",
            render: (_, record) => getKetQuaDuDoan(record)
        },
        {
            title: "Sai số dự đoán",
            width: 150,
            align: "center",
            render: (_, record) => getSaiSo(record)
        }

    ];


    return (

        <div className="admin-page space-y-4">

                <div className="flex justify-end">
                    <Button
                        icon={<DownloadOutlined />}
                        loading={exporting}
                        onClick={handleExportExcel}
                    >
                        Xuất Excel
                    </Button>
                </div>

                <Text className="!block !text-sm !text-slate-500">
                    Chỉ xét giải các bài có điểm đạt từ tỷ lệ đạt của đợt thi trở lên.
                </Text>

                <Row gutter={[16,16]}>
                    <Col md={24} lg={10}>
                        <Select
                            style={{
                                width: "100%",
                            }}
                            showSearch
                            value={selectedCuocThi}
                            onChange={(value) => setSelectedCuocThi(value)}
                            allowClear
                            placeholder="Chọn cuộc thi"
                            loading={cuocThiLoading}
                            filterOption={false}
                            options={dsCuocThi.map((item) => ({
                                label: item.ten,
                                value: item.id,
                            }))}
                            onSearch={setSearchCuocThi}
                            onPopupScroll={(e) => {

                                const target = e.target;

                                if (
                                    target.scrollTop +
                                    target.offsetHeight >=
                                    target.scrollHeight - 10
                                ) {

                                    cuocThiLoadMore();

                                }

                            }}
                        />
                    </Col>
                    <Col md={24} lg={4}>
                        <Select
                            style={{
                                width: "100%",
                            }}
                            showSearch
                            value={selectedDotThi}
                            onChange={(value) => setSelectedDotThi(value)}
                            allowClear
                            placeholder="Chọn đợt thi"
                            loading={dotThiLoading}
                            filterOption={false}
                            options={dsDotThi.map((item) => ({
                                label: item.ten,
                                value: item.id,
                            }))}
                            onSearch={setSearchDotThi}
                            onPopupScroll={(e) => {

                                const target = e.target;

                                if (
                                    target.scrollTop +
                                    target.offsetHeight >=
                                    target.scrollHeight - 10
                                ) {

                                    dotThiLoadMore();

                                }

                            }}
                        />
                    </Col>
                    <Col md={24} lg={4}>
                        <Select
                            style={{
                                width: "100%",
                            }}
                            showSearch
                            value={selectedTop}
                            onChange={(value) => setSelectedTop(value)}
                            allowClear
                            placeholder="Chọn top"
                            loading={dotThiLoading}
                            filterOption={false}
                            options={[
                                {
                                    value: 3,
                                    label: 'Top 3',
                                },
                                {
                                    value: 5,
                                    label: 'Top 5',
                                },
                                {
                                    value: 10,
                                    label: 'Top 10',
                                },
                                {
                                    value: 20,
                                    label: 'Top 20',
                                },
                                {
                                    value: 50,
                                    label: 'Top 50',
                                },
                                {
                                    value: 100,
                                    label: 'Top 100',
                                }
                            ]}
                        />
                    </Col>
                    <Col md={12} lg={3}>
                        <Button
                            className="w-full"
                            type="primary"
                            icon={<SearchOutlined />}
                            loading={loading}
                            onClick={() => void handleSearch()}
                        >
                            Tìm kiếm
                        </Button>
                    </Col>
                    <Col md={12} lg={3}>
                        <Button
                            className="w-full"
                            icon={<ReloadOutlined />}
                            loading={loading}
                            onClick={() => void handleRefresh()}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>




            <Table
                className="admin-table"
                rowKey={(record) =>
                    getBaiThiId(record)
                    || `${getThiSinh(record)?.username || "thi-sinh"}-${getThiSinh(record)?.id || "na"}`
                }
                loading={loading}
                columns={columns}
                dataSource={data}
                scroll={{x: 1420}}
                pagination={{
                    responsive: true,
                    showSizeChanger: true,
                }}
            />



        </div>

    );

}
