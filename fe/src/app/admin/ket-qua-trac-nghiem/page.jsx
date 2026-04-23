'use client'

import {useCallback, useEffect, useState} from "react";
import {App, Col, Row, Select, Table} from "antd";
import {usePageInfoStore} from "~/store/page-info";
import {xepHangTracNghiemTheoCuocThi, xepHangTracNghiemTheoDotThi} from "~/services/thi/thi";
import {useCuocThiSelect} from "~/hook/useCuocThi";
import {useDotThiSelect} from "~/hook/useDotThi";


export default function NhomCauHoi() {

    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const { message } = App.useApp();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cuocThi, setCuocThi] = useState(null);
    const [dotThi, setDotThi] = useState(null);
    const [top, setTop] = useState(10);

    const { dsCuocThi, loading: cuocThiLoading, setSearchCuocThi, loadMore: cuocThiLoadMore } = useCuocThiSelect();
    const { dsDotThi, loading: dotThiLoading, setSearchDotThi, loadMore: dotThiLoadMore } = useDotThiSelect(cuocThi);

    // ===== fetch =====

    const fetchData = useCallback(async () => {

        setLoading(true);

        try {

            const res = await xepHangTracNghiemTheoDotThi(dotThi, top);

            setData(res || []);



        } catch (e) {

            message.error(e.message);

        } finally {

            setLoading(false);

        }

    }, [dotThi, message, top]);

    const fetchDataCuocThi = useCallback(async () => {

        setLoading(true);

        try {

            const res = await xepHangTracNghiemTheoCuocThi(cuocThi, top);

            setData(res || []);



        } catch (e) {

            message.error(e.message);

        } finally {

            setLoading(false);

        }

    }, [cuocThi, message, top]);

    useEffect(() => {
        if (!cuocThi) {
            setDotThi(null);
        }
    }, [cuocThi]);

    useEffect(() => {
        if (!dotThi) {
            setData([]);
            if (cuocThi) {
                void fetchDataCuocThi();
            }
        }
    }, [cuocThi, dotThi, fetchDataCuocThi]);

    // ===== search =====

    useEffect(() => {
        if (!dotThi) {
            setData([]);
            if (cuocThi) {
                void fetchDataCuocThi();
            }
            return;
        }

        void fetchData();

    }, [cuocThi, dotThi, fetchData, fetchDataCuocThi, top]);


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
            dataIndex: "thi_sinh",
            width: 300,
            render: (text) => text.ho_ten
        },
        {
            title: "Số điện thoại",
            dataIndex: "thi_sinh",
            width: 300,
            render: (text) => text?.username
        },
        {
            title: "Điểm",
            dataIndex: "diem",
        },
        {
            title: "Thơi gian làm bài",
            dataIndex: "thoi-gian-lam-bai",
            align: "center",
            render: (_, record) => {

                if (!record.thoi_gian || !dotThi)
                    return "-"

                const diff = Math.min(dsDotThi.filter(t => t.id === dotThi)[0]?.thoi_gian_thi*60, record.thoi_gian)




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
            title: "Số dự đoán",
            dataIndex: "so_du_doan",
            render: (text) => text ? text : 0
        },
        {
            title: "Sai số dự đoán",
            dataIndex: "sai_so",
            render: (text) => text ? text : 0
        }

    ];


    return (

        <div className="admin-page space-y-4">

                <Row gutter={[16,16]}>
                    <Col md={24} lg={10}>
                        <Select
                            style={{
                                width: "100%",
                            }}
                            showSearch
                            value={cuocThi}
                            onChange={(e) => setCuocThi(e)}
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
                            value={dotThi}
                            onChange={(e) => setDotThi(e)}
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
                            value={top}
                            onChange={(e) => setTop(e)}
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
                </Row>




            <Table
                className="admin-table"
                rowKey={(record) =>
                    record.bai_thi_id
                    || `${record?.thi_sinh?.username || "thi-sinh"}-${record?.thi_sinh?.id || "na"}`
                }
                loading={loading}
                columns={columns}
                dataSource={data}
                scroll={{x: 1040}}
                pagination={{
                    responsive: true,
                    showSizeChanger: true,
                }}
            />



        </div>

    );

}
