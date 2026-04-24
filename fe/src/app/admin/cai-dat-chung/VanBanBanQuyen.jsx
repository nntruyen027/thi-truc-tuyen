'use client';

import {Button, Card, Form} from "antd";
import Editor from "~/app/components/common/Editor";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";
import useApp from "antd/es/app/useApp";

export default function BanQuyen({workspaceId = null}) {
    const [form] = Form.useForm();
    const {message} = useApp()
    const [loading, setLoading] = useState(true);

    const save = async () => {

        try {

            setLoading(true);

            const values =
                await form.validateFields();

            await suaCauHinh(
                'van-ban-ban-quyen',
                values.noiDung,
                {workspaceId}
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
        const load = async () => {
            const res =
                await layCauHinh('van-ban-ban-quyen', {workspaceId})

            if (!res.data) return

            const val = res.data.gia_tri

            form.setFieldsValue({noiDung: val})
        }

        void load()
    }, [form, workspaceId])

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
