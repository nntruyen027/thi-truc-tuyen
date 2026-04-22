'use client'

import {useEffect, useState} from "react";
import {App, Button, Divider, Dropdown, Input, Modal, Table} from "antd";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";

import {layDotThi, xoaDotThi} from "~/services/thi/dot-thi";
import {DeleteOutlined, EditOutlined, EllipsisOutlined, FileDoneOutlined, FileTextOutlined} from "@ant-design/icons";
import DotThiModal from "./DotThiModal";
import dayjs from "dayjs";
import {useParams} from "next/navigation";
import {layCuocThiTheoId} from "~/services/thi/cuoc-thi";
import Link from "next/link";
import TracNghiemModal from "./TracNghiemModal";
import TuLuanDotThiModal from "~/app/admin/cuoc-thi/[id]/dot-thi/TuLuanModal";


export default function DotThi() {

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();
    const {id:cuocThiId} = useParams();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTracNghiemOpen, setModalTracNghiemOpen] = useState(false)
    const [modalTuLuanOpen, setModalTuLuanOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [cuocThi, setCuocThi] = useState({});


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

    const fetchCuocThi = async () => {
        try {
            setLoading(true);
            const res = await layCuocThiTheoId(cuocThiId)
            setCuocThi(res.data);
        }
        catch (e) {
            message.error(e.message);
        }
        finally {
            setLoading(false);
        }

    }

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

            const res = await layDotThi(cuocThiId,{
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
            await xoaDotThi(deletingId, cuocThiId);
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
        fetchCuocThi();

        setPageInfo({
            title: "Đợt thi"
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
            title: "Tên đợt thi",
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
                        key: 'trac-nghiem',
                        label: 'Trắc nghiệm',
                        icon: <FileDoneOutlined />,
                        onClick: () => {
                            setEditing(record);
                            setModalTracNghiemOpen(true);
                        }
                    },
                    {
                        key: 'tu-luan',
                        label: 'Tự luận',
                        icon: <FileTextOutlined />,
                        onClick: () => {
                            setEditing(record);
                            setModalTuLuanOpen(true);
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

        <div style={{ padding: 16 }}>
            <Link href={'/admin/cuoc-thi'}>
                <div className={'flex flex-col text-center w-full p-2'}>
                <h2 className={'text-xl text-black'}>{cuocThi?.ten}</h2>
                <div className={'text-gray-600'}>Thời gian bắt đầu: {dayjs(cuocThi?.["thoi_gian_bat_dau"]).format("DD/MM/YYYY hh:mm:ss")}</div>
                <div className={'text-gray-600'}>Thời gian kết thúc: {dayjs(cuocThi?.["thoi_gian_ket_thuc"]).format("DD/MM/YYYY hh:mm:ss")}</div>
            </div>
            </Link>


            <Divider/>


            <div className="flex justify-between">

                <Input.Search
                    placeholder="Tìm đợt thi..."
                    allowClear
                    style={{ width: 300 }}
                    onChange={e =>
                        setSearchText(e.target.value)
                    }
                />

                <Button
                    type="primary"
                    onClick={() => {
                        setEditing(null)
                        setModalOpen(true)
                    }}>
                    Thêm đợt thi
                </Button>

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

            <DotThiModal
                open={modalOpen}
                data={editing}
                cuocThiId={cuocThiId}
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
            <TracNghiemModal
                open={modalTracNghiemOpen}
                cuocThiId={cuocThiId}
                onClose={() => setModalTracNghiemOpen(false)}
                dotThiId={editing?.id}
            />
            <TuLuanDotThiModal
                open={modalTuLuanOpen}
                cuocThiId={cuocThiId}
                onClose={() => setModalTuLuanOpen(false)}
                dotThiId={editing?.id}
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
                Bạn có chắc muốn xóa đợt thi này không?
            </Modal>

        </div>

    );

}