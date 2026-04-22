'use client'

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Input, Modal, Table, Upload} from "antd";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";

import {importTracNghiem, layTracNghiem, xoaTracNghiem} from "~/services/thi/trac_nghiem";
import {DeleteOutlined, DownloadOutlined, EditOutlined, EllipsisOutlined, UploadOutlined} from "@ant-design/icons";
import TracNghiemModal from "./TracNghiemModal";


export default function TracNghiem() {

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [file, setFile] = useState(null);


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

            const res = await layTracNghiem({
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

    const handleImportFile = (file) => {

        Modal.confirm({

            title: "Import dữ liệu ?",

            content:
            file.name,

            okText: "Import",
            cancelText: "Hủy",

            onOk: async () => {

                try {

                    await importTracNghiem(
                        file
                    )

                    message.success(
                        "Import thành công"
                    )

                    fetchData(
                        pagination.current,
                        pagination.pageSize,
                        debouncedSearch,
                        sorter.sortField,
                        sorter.sortType
                    )

                }
                catch (e) {

                    message.error(
                        e.message
                    )

                }

            }

        })

        return false

    }

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaTracNghiem(deletingId);
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
            title: "Trắc nghiệm"
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
            title: "Câu hỏi",
            dataIndex: "cau_hoi",
            sorter: true,
            width: 600,
        },
        {
            title: "Lĩnh vực",
            dataIndex: "linh_vuc",
            sorter: true,
            render: (_, record) => record?.linh_vuc?.ten
        },
        {
            title: "Nhóm câu hỏi",
            dataIndex: "nhom",
            sorter: true,
            render: (_, record) => record?.nhom?.ten
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

    const importMenu = [

        {
            key: "download",
            label: (
                <a
                    href="/uploads/template/trac_nghiem.xlsx"
                    target="_blank"
                >
                    Tải file mẫu
                </a>
            ),
            icon: <DownloadOutlined />
        },

        {
            key: "upload",

            label: (

                <Upload
                    showUploadList={false}
                    beforeUpload={handleImportFile}
                    maxCount={1}
                >

                    Import file

                </Upload>

            ),

            icon: <UploadOutlined />

        }

    ]


    return (

        <div style={{ padding: 16 }}>

            <div className="flex justify-between">

                <Input.Search
                    placeholder="Câu hỏi..."
                    allowClear
                    style={{ width: 300 }}
                    onChange={e =>
                        setSearchText(e.target.value)
                    }
                />

                <div className="flex gap-2">

                    <Dropdown
                        menu={{ items: importMenu }}
                    >
                        <Button>
                            Import
                        </Button>
                    </Dropdown>

                    <Button
                        type="primary"
                        onClick={() => {
                            setEditing(null)
                            setModalOpen(true)
                        }}
                    >
                        Thêm câu hỏi
                    </Button>

                </div>

            </div>


            <Table
                style={{ marginTop: 16 }}
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}

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

            <TracNghiemModal
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
                Bạn có chắc muốn xóa câu hỏi này không?
            </Modal>

        </div>

    );

}