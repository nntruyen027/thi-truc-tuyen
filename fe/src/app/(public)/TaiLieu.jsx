import {layCauHinh} from "~/services/cau-hinh";
import {useEffect, useState} from "react";
import {getPublicFileUrl} from "~/services/file";
import {Card, theme, Typography} from "antd";

export default function TaiLieu({title, khoa, id =''}) {
    const [url, setUrl] = useState("");
    const {token} = theme.useToken()

    const load = async () => {

        const res =
            await layCauHinh(khoa);


        if (!res.data) return;


        const val =
            JSON.parse(
                res.data.gia_tri
            );

        setUrl(val.url)

    };

    useEffect(() => {
        void load()
    }, [])

    return (
        <Card id={id}
            styles={{body: {bodypadding: 0}}}
        title={<Typography.Title style={{
            color: token.colorPrimary,
            margin: "12px"
        }} className={'text-center uppercase'}>{title}</Typography.Title>}>


        {url && (
            <iframe
                src={
                    getPublicFileUrl(
                        url
                    )+ "#zoom=100&navpanes=0"
                }
                width="100%"
                height="800"
                style={{
                    margin:0
                }}
            />

        )}
    </Card>)
}