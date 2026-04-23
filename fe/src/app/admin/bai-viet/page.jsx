'use client'

import {useCallback, useEffect, useMemo, useState} from "react";
import {App, Button, Dropdown, Input, Modal, Table, Tag} from "antd";
import {DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {usePageInfoStore} from "~/store/page-info";
import BaiVietModal from "~/app/admin/bai-viet/BaiVietModal";
import {layDanhSachBaiViet, suaBaiViet, taoBaiViet, xoaBaiViet} from "~/services/bai-viet";

function stripHtml(html = "") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function BaiVietPage() {
    const setPageInfo = usePageInfoStore((state) => state.setPageInfo);
    const {message} = App.useApp();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const danhSach = await layDanhSachBaiViet({
                chiHienThi: false,
                size: 200,
            });
            setData(danhSach.data || []);
        } catch (e) {
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [message]);

    useEffect(() => {
        setPageInfo({title: "Bài viết cuộc thi"});
        void load();
    }, [load, setPageInfo]);

    const filteredData = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        if (!keyword) {
            return data;
        }

        return data.filter((item) => {
            const content = [
                item.tieuDe,
                item.tomTat,
                stripHtml(item.noiDung),
            ].join(" ").toLowerCase();

            return content.includes(keyword);
        });
    }, [data, searchText]);

    const handleSave = async (values) => {
        try {
            if (editing?.id) {
                await suaBaiViet(editing.id, values);
            } else {
                await taoBaiViet(values);
            }

            await load();
            setModalOpen(false);
            setEditing(null);
            message.success(editing ? "Đã cập nhật bài viết" : "Đã tạo bài viết");
        } catch (e) {
            message.error(e.message);
        }
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaBaiViet(deletingId);
            await load();
            message.success("Đã xóa bài viết");
        } catch (e) {
            message.error(e.message);
        } finally {
            setDeleteModalVisible(false);
            setDeletingId(null);
        }
    };

    const columns = [
        {
            title: "#",
            width: 60,
            align: "right",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tiêu đề",
            dataIndex: "tieuDe",
            render: (value, record) => (
                <div className="space-y-1">
                    <div className="font-semibold text-slate-900">{value}</div>
                    <div className="line-clamp-2 text-sm text-slate-500">
                        {record.tomTat || stripHtml(record.noiDung)}
                    </div>
                </div>
            )
        },
        {
            title: "Ngày đăng",
            dataIndex: "ngayDang",
            width: 180,
            render: (value) => (
                <Tag color="blue">
                    {value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "--"}
                </Tag>
            )
        },
        {
            title: "Cập nhật",
            dataIndex: "updatedAt",
            width: 180,
            render: (value) => value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "--"
        },
        {
            title: "Hành động",
            width: 120,
            render: (_, record) => {
                const items = [
                    {
                        key: "edit",
                        label: "Sửa",
                        icon: <EditOutlined/>,
                        onClick: () => {
                            setEditing(record);
                            setModalOpen(true);
                        }
                    },
                    {
                        key: "delete",
                        label: "Xóa",
                        danger: true,
                        icon: <DeleteOutlined/>,
                        onClick: () => handleDelete(record.id)
                    }
                ];

                return (
                    <Dropdown menu={{items}}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <div className="admin-page">
            <div className="admin-toolbar">
                <Input.Search
                    className="admin-toolbar__search"
                    placeholder="Tìm bài viết..."
                    allowClear
                    onChange={(event) => setSearchText(event.target.value)}
                />

                <div className="admin-toolbar__actions">
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditing(null);
                            setModalOpen(true);
                        }}
                    >
                        Thêm bài viết
                    </Button>
                </div>
            </div>

            <Table
                className="admin-table"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={filteredData}
                scroll={{x: 980}}
                pagination={{
                    pageSize: 10,
                    responsive: true,
                    showSizeChanger: false,
                }}
            />

            <BaiVietModal
                open={modalOpen}
                data={editing}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSuccess={handleSave}
            />

            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okButtonProps={{danger: true}}
                okText="Xóa"
                cancelText="Thoát"
            >
                Bạn có chắc muốn xóa bài viết này không?
            </Modal>
        </div>
    );
}
