'use client';

import {useCallback, useEffect, useMemo, useState} from "react";
import {App, Button, Card, Col, Row, Select, Table, Tag, Typography} from "antd";
import {DownloadOutlined, ReloadOutlined} from "@ant-design/icons";
import {usePageInfoStore} from "~/store/page-info";
import {
    layThongKeThamGiaTheoDonVi,
    xuatThongKeThamGiaTheoDonViExcel
} from "~/services/thi/thi";
import {useCuocThiSelect} from "~/hook/useCuocThi";
import {useDotThiSelect} from "~/hook/useDotThi";

const {Text} = Typography;

function formatNumber(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}

function formatPercent(value) {
    return `${Number(value || 0).toFixed(2)}%`;
}

export default function ThongKeThamGiaTheoDonViPage() {
    const {message} = App.useApp();
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState([]);
    const [cuocThi, setCuocThi] = useState(null);
    const [dotThi, setDotThi] = useState(null);

    const { dsCuocThi, loading: cuocThiLoading, setSearchCuocThi, loadMore: cuocThiLoadMore } = useCuocThiSelect();
    const { dsDotThi, loading: dotThiLoading, setSearchDotThi, loadMore: dotThiLoadMore } = useDotThiSelect(cuocThi);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const res = await layThongKeThamGiaTheoDonVi({
                cuocThiId: cuocThi,
                dotThiId: dotThi,
            });
            setData(res || []);
        } catch (e) {
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [cuocThi, dotThi, message]);

    const handleExportExcel = useCallback(async () => {
        setExporting(true);

        try {
            const blob = await xuatThongKeThamGiaTheoDonViExcel({
                cuocThiId: cuocThi,
                dotThiId: dotThi,
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "thong-ke-tham-gia-theo-don-vi.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            message.error(e.message);
        } finally {
            setExporting(false);
        }
    }, [cuocThi, dotThi, message]);

    useEffect(() => {
        setPageInfo({
            title: "Thống kê tham gia theo đơn vị",
        });
    }, [setPageInfo]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (!cuocThi) {
            setDotThi(null);
        }
    }, [cuocThi]);

    const summary = useMemo(() => {
        return data.reduce((acc, item) => {
            acc.tongTaiKhoanThiSinh += Number(item?.tong_tai_khoan_thi_sinh || 0);
            acc.soNguoiThamGia += Number(item?.so_nguoi_tham_gia || 0);
            acc.tongTaiKhoanDangVien += Number(item?.tong_tai_khoan_dang_vien || 0);
            acc.soDangVienThamGia += Number(item?.so_dang_vien_tham_gia || 0);
            acc.soLuotNopBai += Number(item?.so_luot_nop_bai || 0);
            return acc;
        }, {
            tongTaiKhoanThiSinh: 0,
            soNguoiThamGia: 0,
            tongTaiKhoanDangVien: 0,
            soDangVienThamGia: 0,
            soLuotNopBai: 0,
        });
    }, [data]);

    const columns = useMemo(() => ([
        {
            title: "STT",
            dataIndex: "stt",
            width: 80,
            align: "center",
            fixed: "left",
        },
        {
            title: "Tên đơn vị",
            dataIndex: "ten_don_vi",
            width: 280,
            fixed: "left",
            render: (value) => <span className="font-medium text-slate-900">{value}</span>,
        },
        {
            title: "Tổng tài khoản thí sinh",
            dataIndex: "tong_tai_khoan_thi_sinh",
            width: 180,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Số người tham gia",
            dataIndex: "so_nguoi_tham_gia",
            width: 160,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Tổng tài khoản Đảng viên",
            dataIndex: "tong_tai_khoan_dang_vien",
            width: 200,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Số Đảng viên tham gia",
            dataIndex: "so_dang_vien_tham_gia",
            width: 180,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Số lượt nộp bài",
            dataIndex: "so_luot_nop_bai",
            width: 150,
            align: "right",
            render: formatNumber,
        },
        {
            title: "Tỷ lệ tham gia (%)",
            dataIndex: "ty_le_tham_gia",
            width: 150,
            align: "right",
            render: (value) => (
                <Tag color={Number(value || 0) >= 70 ? "blue" : "default"}>
                    {formatPercent(value)}
                </Tag>
            ),
        },
    ]), []);

    return (
        <div className="admin-page space-y-4">
            <Card className="rounded-[28px] border-0 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <Text className="!block !text-sm !text-slate-500">
                            Bảng thống kê tổng hợp theo toàn bộ đơn vị, tính trên các tài khoản thí sinh hiện có và các bài đã nộp.
                        </Text>
                        <div className="flex flex-wrap gap-2">
                            <Tag color="blue">Đơn vị: {formatNumber(data.length)}</Tag>
                            <Tag>Tổng tài khoản thí sinh: {formatNumber(summary.tongTaiKhoanThiSinh)}</Tag>
                            <Tag>Tổng người tham gia: {formatNumber(summary.soNguoiThamGia)}</Tag>
                            <Tag>Tổng tài khoản Đảng viên: {formatNumber(summary.tongTaiKhoanDangVien)}</Tag>
                            <Tag>Tổng Đảng viên tham gia: {formatNumber(summary.soDangVienThamGia)}</Tag>
                            <Tag>Tổng lượt nộp bài: {formatNumber(summary.soLuotNopBai)}</Tag>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            icon={<DownloadOutlined />}
                            loading={exporting}
                            onClick={() => void handleExportExcel()}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            loading={loading}
                            onClick={() => void loadData()}
                        >
                            Làm mới
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="rounded-[28px] border-0 shadow-sm">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={10}>
                        <Select
                            style={{width: "100%"}}
                            showSearch
                            value={cuocThi}
                            onChange={(value) => setCuocThi(value)}
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
                    <Col xs={24} lg={10}>
                        <Select
                            style={{width: "100%"}}
                            showSearch
                            value={dotThi}
                            onChange={(value) => setDotThi(value)}
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
                    <Col xs={24} lg={4}>
                        <Button
                            className="w-full"
                            icon={<ReloadOutlined />}
                            loading={loading}
                            onClick={() => void loadData()}
                        >
                            Áp dụng
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card className="rounded-[28px] border-0 shadow-sm">
                <Table
                    className="admin-table"
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    scroll={{x: 1500}}
                    pagination={{
                        pageSize: 20,
                        responsive: true,
                        showSizeChanger: true,
                    }}
                />
            </Card>
        </div>
    );
}
