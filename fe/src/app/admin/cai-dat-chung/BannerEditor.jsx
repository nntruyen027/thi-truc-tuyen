import {App, Button, Card, Slider, Typography, Upload} from "antd";
import {useEffect, useState} from "react";
import {layCauHinh, suaCauHinh} from "~/services/cau-hinh";
import {getPublicFileUrl, uploadFile} from "~/services/file";
import {UploadOutlined} from "@ant-design/icons";

export default function BannerEditor({

                          title,
                          khoa,
                                         aspectRatio="16/9"
                      }) {

    const {message} = App.useApp()

    const [image, setImage] =
        useState(null)

    const [zoom, setZoom] =
        useState(1)


    useEffect(() => {
        let active = true

        const timer =
            setTimeout(async () => {

                const res =
                    await layCauHinh(khoa)

                if (!active || !res.data) return

                const val =
                    JSON.parse(
                        res.data.gia_tri
                    )

                setImage(val.url)
                setZoom(val.zoom || 1)

            }, 0)

        return () => {
            active = false
            clearTimeout(timer)
        }

    }, [khoa])



    // save

    const save = async (url, z) => {

        await suaCauHinh(
            khoa,
            JSON.stringify({
                url,
                zoom: z
            })
        )

    }



    // upload

    const upload =
        async (file) => {

            const res =
                await uploadFile(file)


            setImage(res.url)

            await save(res.url, zoom)

            message.success(
                "Đã cập nhật"
            )

            return false

        }



    // zoom change

    const changeZoom =
        async (z) => {

            setZoom(z)

            if (image)
                await save(
                    image,
                    z
                )

        }



    return (

        <Card title={title}>
            <Typography.Text type="secondary">
                Tỷ lệ khuyến nghị: {aspectRatio}
            </Typography.Text>

            <Upload
                showUploadList={false}
                beforeUpload={upload}
            >

                <Button
                    icon={<UploadOutlined/>}
                >
                    Tải ảnh
                </Button>

            </Upload>


            {/* preview 16:9 */}

            <div
                style={{
                    marginTop: 12,
                    width: "100%",
                    aspectRatio: aspectRatio,
                    border: "1px solid #ddd",
                    overflow: "hidden",
                    position: "relative"
                }}
            >

                {image && (

                    <img
                        src={
                            getPublicFileUrl(
                                image
                            )
                        }
                        alt=""
                        style={{
                            width: `${100 * zoom}%`,
                            height: `${100 * zoom}%`,
                            objectFit: "cover",
                            objectPosition: "center",
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform:
                                "translate(-50%, -50%)"
                        }}
                    />

                )}

            </div>


            <div
                style={{
                    marginTop: 10
                }}
            >

                Zoom

                <Slider
                    min={1}
                    max={2}
                    step={0.1}
                    value={zoom}
                    onChange={changeZoom}
                />

            </div>

        </Card>

    )

}
