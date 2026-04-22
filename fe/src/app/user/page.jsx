'use client';

import {useEffect, useState} from "react";

import {Button, Card, Spin, Table, Tag, Typography} from "antd";

import {useRouter} from "next/navigation";

import {lichSuThi} from "~/services/thi/thi";

import {layDotThiHienTai} from "~/services/thi/dot-thi";
import Profile from "~/app/user/Profile";


const {Title} = Typography;


export default function Page() {

    const router = useRouter();

    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(true);

    const [dotThi, setDotThi] = useState(null);


    useEffect(() => {

        async function load() {

            try {

                const dot =
                    await layDotThiHienTai();

                setDotThi(dot.data);

                const ds =
                    await lichSuThi(
                        dot.data.id
                    );

                setData(ds);

            }
            finally {

                setLoading(false);

            }

        }

        load();

    }, []);


    function trangThaiTag(v) {

        if (v === 0)
            return <Tag color="blue">Đang thi</Tag>;

        if (v === 1)
            return <Tag color="green">Đã nộp</Tag>;

        return <Tag>Chưa thi</Tag>;

    }


    function actionBtn(row) {

        // đang thi

        if (row.trang_thai === 0) {

            return (
                <Button
                    type="primary"
                    onClick={() =>
                        router.push(
                            "/user/thi"
                        )
                    }
                >
                    Tiếp tục
                </Button>
            );

        }

        // đã nộp

        if (row.trang_thai === 1) {

            return <></>;

        }

        // chưa thi

        return (
            <Button
                type="primary"
                onClick={() =>
                    router.push(
                        "/user/thi"
                    )
                }
            >
                Bắt đầu
            </Button>
        );

    }


    const columns = [

        {
            title: "Đợt thi",
            dataIndex: "dot_thi",
            render: (text, record) => {
                return text.ten
            }
        },

        {
            title: "Lần thi",
            dataIndex: "lan_thi",
            align: "center"
        },

        {
            title: "Trạng thái",
            align: "center",
            render: (_, r) =>
                trangThaiTag(
                    r.trang_thai
                )
        },

        {
            title: "Điểm trắc nghiệm",
            dataIndex: "diem",
            align: "center"
        },
        {
            title: "Số dự đoán",
            dataIndex: "so_du_doan",
            align: "center"
        },
        {
            title: "Thơi gian làm bài",
            dataIndex: "thoi-gian-lam-bai",
            align: "center",
            render: (_, record) => {

                if (!record.thoi_gian_nop)
                    return "-"

                const diff =
                    Math.min(
                        record.tong_thoi_gian_da_lam,
                        record?.dot_thi?.thoi_gian_thi * 60
                    )



                const m =
                    Math.floor(diff / 60)

                const s =
                    diff % 60

                return `${m}:${s
                    .toString()
                    .padStart(2, "0")}`

            }
        },

        {
            title: "Hành động",
            render: (_, r) =>
                actionBtn(r)
        }

    ];


    if (loading)
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Spin size="large"/>
            </div>
        );


    return (

        <div
            className={"p-5 max-w-[1200] my-0 mx-auto flex flex-col gap-3"}

        >
            <Profile/>

            <Card>
                <div className={'flex justify-between'}>
                    <Title level={3}>
                        Lịch sử thi
                    </Title>
                    <Button
                        type="primary"
                        onClick={() =>
                            router.push(
                                "/user/thi"
                            )
                        }
                    >
                        Bắt đầu thi
                    </Button>
                </div>



                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                />

            </Card>

        </div>

    );

}