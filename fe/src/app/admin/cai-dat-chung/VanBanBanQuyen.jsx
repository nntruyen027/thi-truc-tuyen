'use client';

import {Button, Card, Form} from "antd";
import Editor from "~/app/components/common/Editor";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";
import useApp from "antd/es/app/useApp";

export default function BanQuyen() {
    const [form] = Form.useForm();
    const {message} = useApp()
    const [loading, setLoading] = useState(true);

    const load = async () => {

        const res =
            await layCauHinh('van-ban-ban-quyen')

        if (!res.data) return

        const val = res.data.gia_tri

        form.setFieldsValue({noiDung: val})
    }


    const save = async () => {

        try {

            setLoading(true);

            const values =
                await form.validateFields();

            await suaCauHinh(
                'van-ban-ban-quyen',
                values.noiDung
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

    return <Card title={'Văn bản bản quyền'}>
        <Form form={form} layout="vertical">
            <Form.Item name={'noiDung'} label={'Nội dung'}>
                <Editor/>
            </Form.Item>
            <div className={'flex justify-end'}>
                <Button onClick={save} type={'primary'}>Lưu lại</Button>
            </div>
        </Form>
    </Card>
}