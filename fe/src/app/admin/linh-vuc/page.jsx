'use client'

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Input, Modal, Table} from "antd";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";

import {layLinhVuc, xoaLinhVuc} from "~/services/dm_chung/linh_vuc";
import {DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import LinhVucModal from "~/app/admin/linh-vuc/LinhVucModal";


export default function LinhVuc() {

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();

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

    const fetchData = async (
        page = 1,
        size = 10,
        search = "",
        sortField,
        sortType
    ) => {

        setLoading(true);

        try {

            const res = await layLinhVuc({
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

    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaLinhVuc(deletingId);
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


    // ===== search =====

    useEffect(() => {

        fetchData(
            1,
            pagination.pageSize,
            debouncedSearch,
            sorter.sortField,
            sorter.sortType
        );

    }, [debouncedSearch]);


    // ===== first load =====

    useEffect(() => {

        fetchData();

        setPageInfo({
            title: "Lĩnh vực"
        });

    }, []);



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
            title: "Tên lĩnh vực",
            dataIndex: "ten",
            sorter: true,
            width: 300,
        },

        {
            title: "Mô tả",
            dataIndex: "mo_ta",
            sorter: true,
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
                    placeholder="Tìm lĩnh vực..."
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
                        Thêm lĩnh vực
                    </Button>
                </div>

            </div>


            <Table
                className="admin-table"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                scroll={{x: 780}}
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

            <LinhVucModal
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
                Bạn có chắc muốn xóa bài viết này không?
            </Modal>

        </div>

    );

}
