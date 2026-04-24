'use client'

import {useCallback, useEffect, useState} from "react";
import {App, Button, Dropdown, Input, Modal, Switch, Table, Tag} from "antd";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";

import {layCuocThi, suaCuocThi, xoaCuocThi} from "~/services/thi/cuoc-thi";
import {DeleteOutlined, DiffOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import CuocThiModal from "./CuocThiModal";
import dayjs from "dayjs";
import {useRouter} from "next/navigation";
import {parseCuocThiMeta} from "~/utils/cuocThiMeta";


export default function CuocThi() {

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();
    const router = useRouter();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);


    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [sorter, setSorter] = useState({
        sortField: undefined,
        sortType: undefined,
    });


    // ===== fetch =====

    const fetchData = useCallback(async (
        page = 1,
        size = 10,
        search = "",
        sortField,
        sortType
    ) => {

        setLoading(true);

        try {

            const res = await layCuocThi({
                page,
                size,
                search,
                sortField,
                sortType
            });

            setData(res.data || []);

            setPagination({
                current: res.page,
                pageSize: res.size,
                total: res.total
            });

        } catch (e) {

            message.error(e.message);

        } finally {

            setLoading(false);

        }

    }, [message]);

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaCuocThi(deletingId);
            message.success("Xóa thành công");

            if (data.length === 1 && pagination.current > 1)
                fetchData(pagination.current - 1, pagination.pageSize, debouncedSearch,sorter.sortField,
                    sorter.sortType);
            else
                fetchData(
                    pagination.current,
                    pagination.pageSize,
                    debouncedSearch,
                    sorter.sortField,
                    sorter.sortType
                );

        } finally {
            setDeleteModalVisible(false);
            setDeletingId(null);
        }
    };

    const toggleCongBoKetQua = async (record, checked) => {
        try {
            await suaCuocThi(record.id, {
                ...record,
                cho_phep_xem_lich_su: checked,
            });

            message.success(
                checked
                    ? "Đã công bố kết quả"
                    : "Đã hủy công bố kết quả"
            );

            fetchData(
                pagination.current,
                pagination.pageSize,
                debouncedSearch,
                sorter.sortField,
                sorter.sortType
            );
        } catch (e) {
            message.error(e.message);
        }
    };


    // ===== search =====

    useEffect(() => {

        fetchData(
            1,
            pagination.pageSize,
            debouncedSearch,
            sorter.sortField,
            sorter.sortType
        );

    }, [debouncedSearch, fetchData, pagination.pageSize, sorter.sortField, sorter.sortType]);


    // ===== first load =====

    useEffect(() => {

        fetchData();

        setPageInfo({
            title: "Cuộc thi"
        });

    }, [fetchData, setPageInfo]);



    // ===== columns =====

    const columns = [

        {
            title: "#",
            width: 60,
            align: "right",
            render: (_, __, index) =>
                (pagination.current - 1) *
                pagination.pageSize +
                index +
                1
        },

        {
            title: "Tên cuộc thi",
            dataIndex: "ten",
            sorter: true,
            width: 300,
        },

        {
            title: "Mô tả",
            dataIndex: "mo_ta",
            sorter: true,
            render: (value) => {
                const meta = parseCuocThiMeta(value);
                return meta.mo_ta_tom_tat || value || "-";
            }
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "thoi_gian_bat_dau",
            sorter: true,
            render: (text) => dayjs(text).format("DD-MM-YYYY HH:mm:ss"),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "thoi_gian_ket_thuc",
            sorter: true,
            render: (text) => dayjs(text).format("DD-MM-YYYY HH:mm:ss"),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            sorter: true,
            render: (text) => text ? 'Mở' : 'Đóng'
        },
        {
            title: "Công bố kết quả",
            dataIndex: "cho_phep_xem_lich_su",
            width: 180,
            render: (value, record) => (
                <div className="flex items-center gap-3">
                    <Switch
                        checked={!!value}
                        onChange={(checked) =>
                            toggleCongBoKetQua(record, checked)
                        }
                    />
                    <Tag color={value ? "green" : "default"}>
                        {value ? "Đang công bố" : "Chưa công bố"}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Hành động',
            width: 150,
            render: (_, record) => {

                const items = [
                    {
                        key: 'edit',
                        label: 'Sửa',
                        icon: <EditOutlined />,
                        onClick: () => {
                            setEditing(record);
                            setModalOpen(true);
                        }
                    },
                    {
                        key: 'dot-thi',
                        label: 'Đợt thi',
                        icon: <DiffOutlined />,
                        onClick: () => {
                           router.push(`/admin/cuoc-thi/${record.id}/dot-thi`);
                        }
                    },
                    {
                        key: 'delete',
                        label: 'Xóa',
                        danger: true,
                        icon: <DeleteOutlined />,
                        onClick: () => handleDelete(record.id)
                    }
                ]

                return (
                    <Dropdown menu={{ items }}>
                        <Button
                            type="text"
                            icon={<EllipsisOutlined />}
                        />
                    </Dropdown>
                )
            }
        }

    ];


    return (

        <div className="admin-page">

            <div className="admin-toolbar">

                <Input.Search
                    className="admin-toolbar__search"
                    placeholder="Tìm cuộc thi..."
                    allowClear
                    onChange={e =>
                        setSearchText(e.target.value)
                    }
                />

                <div className="admin-toolbar__actions">
                    <Button
                        type="primary"
                        onClick={() => {
                        setEditing(null)
                        setModalOpen(true)
                    }}>
                        Thêm cuộc thi
                    </Button>
                </div>

            </div>


            <Table
                className="admin-table"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                scroll={{x: 1120}}
                pagination={{
                    ...pagination,
                    responsive: true,
                    showSizeChanger: true,
                }}

                onChange={(p, filters, sorterValue) => {

                    const sortField = sorterValue.field;

                    const sortType =
                        sorterValue.order === "ascend"
                            ? "asc"
                            : sorterValue.order === "descend"
                                ? "desc"
                                : undefined;

                    setSorter({
                        sortField,
                        sortType
                    });

                    fetchData(
                        p.current,
                        p.pageSize,
                        debouncedSearch,
                        sortField,
                        sortType
                    );

                }}
            />

            <CuocThiModal
                open={modalOpen}
                data={editing}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false)
                    fetchData(
                        pagination.current,
                        pagination.pageSize,
                        debouncedSearch,
                        sorter.sortField,
                        sorter.sortType
                    )
                }}
            />
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okButtonProps={{danger: true}}
                okText={'Xóa'}
                cancelText={'Thoát'}
            >
                Bạn có chắc muốn xóa cuộc thi này không?
            </Modal>

        </div>

    );

}
