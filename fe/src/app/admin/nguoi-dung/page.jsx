'use client'

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Input, Table} from "antd";

import {useDebounce} from "~/hook/data";
import {usePageInfoStore} from "~/store/page-info";

import {capNhatMatKhau, layDsNguoiDung} from "~/services/dm_chung/nguoi_dung";
import {EditOutlined, EllipsisOutlined} from "@ant-design/icons";


export default function NguoiDung() {

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)


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

    ) => {

        setLoading(true);

        try {

            const res = await layDsNguoiDung({
                page,
                size,
                search
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

    const handleUpdatePass = async (username) => {
        try {
            await capNhatMatKhau(username)
            message.success("Đã cập nhật về mật khẩu mặc định: Thitructuyen@2026")
        } catch (e) {
            message.error(e.message);
        }
    }



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
            title: "Người dùng"
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
            title: "Tên người dùng",
            dataIndex: "ho_ten",
            sorter: true,
            width: 300,
        },

        {
            title: "Tên đăng nhập",
            dataIndex: "username",
        },
        {
            title: "Đơn vị",
            dataIndex: "don_vi",
            render: (text)=> text?.ten,
        },
        {
            title: 'Hành động',
            width: 150,
            render: (_, record) => {

                const items = [
                    {
                        key: 'edit',
                        label: 'Cập nhật mật khẩu',
                        icon: <EditOutlined />,
                        onClick: () => {
                            handleUpdatePass(record.username)
                        }
                    },
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

            <div className="flex justify-between">

                <Input.Search
                    placeholder="Tìm người dùng..."
                    allowClear
                    style={{ width: 300 }}
                    onChange={e =>
                        setSearchText(e.target.value)
                    }
                />
            </div>


            <Table
                style={{ marginTop: 16 }}
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}

            />


        </div>

    );

}