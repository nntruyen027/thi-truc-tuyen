'use client';

import {Button, Result} from "antd";
import {useRouter} from "next/navigation";
import {usePermission} from "~/hook/usePermission";

export default function NotFound() {
    const router = useRouter();
    const {isAdmin} = usePermission()

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Result
                status="404"
                title="404"
                subTitle="Trang bạn tìm không tồn tại hoặc đã bị xóa."
                extra={[
                    <Button
                        key="home"
                        type="primary"
                        onClick={() => isAdmin() ? router.push("/admin/dashboard") : router.push("/")}
                    >
                        Về trang chủ
                    </Button>,
                    <Button
                        key="back"
                        onClick={() => router.back()}
                    >
                        Quay lại
                    </Button>
                ]}
            />
        </div>
    );
}
