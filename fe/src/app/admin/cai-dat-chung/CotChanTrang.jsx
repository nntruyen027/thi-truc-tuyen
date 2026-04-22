'use client';

import {Button, Card, Form, Input} from "antd";
import Editor from "~/app/components/common/Editor";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";
import useApp from "antd/es/app/useApp";

export default function CotChanTrang({tieuDe, khoa}) {
    const [form] = Form.useForm();
    const {message} = useApp()
    const [loading, setLoading] = useState(true);

    const load = async () => {

        const res =
            await layCauHinh(khoa)

        if (!res.data) return

        const val =
            JSON.parse(
                res.data.gia_tri
            )

        form.setFieldsValue({tieuDe: val.tieuDe, noiDung: val.noiDung})
    }


    const save = async () => {

        try {

            setLoading(true);

            const values =
                await form.validateFields();

            await suaCauHinh(
                khoa,
                JSON.stringify(values)
            );

        }
        catch (e){
            message.error(e.message)
        }
        finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        load()
    }, [])

    return <Card title={tieuDe}>
        <Form form={form} layout="vertical">
            <Form.Item name={'tieuDe'} label={'Tiêu đề'}>
                <Input/>
            </Form.Item>
            <Form.Item name={'noiDung'} label={'Nội dung'}>
                <Editor/>
            </Form.Item>
            <div className={'flex justify-end'}>
                <Button onClick={save} type={'primary'}>Lưu lại</Button>
            </div>
        </Form>
    </Card>
}