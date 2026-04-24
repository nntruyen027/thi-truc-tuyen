"use client";

import {App, Button, Form, Input, Modal, Segmented, Select, Space, Table, Tag, Tooltip} from "antd";
import {useEffect, useMemo, useState} from "react";
import {EditOutlined} from "@ant-design/icons";
import {capNhatWorkspace, layDanhSachWorkspace, taoWorkspace} from "~/services/workspace";
import WorkspaceSettingsPanel from "~/app/admin/cai-dat-chung/WorkspaceSettingsPanel";

export default function SuperAdminPage() {
    const {message} = App.useApp();
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(undefined);
    const [mode, setMode] = useState("workspace");

    const workspaceOptions = useMemo(
        () => (data || []).map((item) => ({
            label: item.ten,
            value: item.id,
        })),
        [data]
    );

    const selectedWorkspace = useMemo(
        () => (data || []).find((item) => Number(item.id) === Number(selectedWorkspaceId)) || null,
        [data, selectedWorkspaceId]
    );

    const load = async () => {
        setLoading(true);
        try {
            const rows = await layDanhSachWorkspace();
            setData(rows || []);

            if (!selectedWorkspaceId && rows?.length) {
                setSelectedWorkspaceId(rows[0].id);
            }
        } catch (error) {
            message.error(error?.message || "Không thể tải danh sách workspace");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenCreate = () => {
        setEditing(null);
        form.resetFields();
        setOpen(true);
    };

    const handleOpenEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            code: record.code,
            ten: record.ten,
            slug: record.slug,
            domain: record.primary_domain,
            status: record.status,
        });
        setOpen(true);
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            if (editing) {
                await capNhatWorkspace(editing.id, values);
                message.success("Đã cập nhật workspace");
            } else {
                await taoWorkspace(values);
                message.success("Đã tạo workspace");
            }

            setOpen(false);
            form.resetFields();
            await load();
        } catch (error) {
            message.error(error?.message || "Không thể lưu workspace");
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: "Tên workspace",
            dataIndex: "ten",
            key: "ten",
            render: (_, record) => (
                <div>
                    <div className="font-semibold text-slate-900">{record.ten}</div>
                    <div className="text-xs text-slate-500">{record.code}</div>
                </div>
            ),
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
        },
        {
            title: "Domain",
            dataIndex: "primary_domain",
            key: "primary_domain",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value, record) => (
                <Space size="small">
                    <Tag color={value === "active" ? "blue" : "default"}>
                        {value === "active" ? "Hoạt động" : "Tạm dừng"}
                    </Tag>
                    {record.is_default ? <Tag color="gold">Mặc định</Tag> : null}
                </Space>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 96,
            align: "center",
            render: (_, record) => (
                <Tooltip title="Cập nhật workspace">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Quản trị hệ thống</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Quản lý workspace và cấu hình riêng cho từng tenant ngay tại một nơi.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Segmented
                            value={mode}
                            onChange={setMode}
                            options={[
                                {label: "Workspace", value: "workspace"},
                                {label: "Cấu hình tenant", value: "settings"},
                            ]}
                        />

                        <Button type="primary" onClick={handleOpenCreate}>
                            Tạo workspace
                        </Button>
                    </div>
                </div>
            </div>

            {mode === "workspace" ? (
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        pagination={false}
                    />
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center">
                            <div>
                                <div className="text-sm font-semibold text-slate-900">Workspace cần cấu hình</div>
                                <div className="mt-1 text-sm text-slate-500">
                                    Chọn tenant để cập nhật màu chủ đạo, banner, favicon và thông tin chân trang.
                                </div>
                            </div>

                            <Select
                                showSearch
                                optionFilterProp="label"
                                placeholder="Chọn workspace"
                                options={workspaceOptions}
                                value={selectedWorkspaceId}
                                onChange={setSelectedWorkspaceId}
                            />
                        </div>

                        {selectedWorkspace ? (
                            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                Đang cấu hình cho <span className="font-semibold text-slate-900">{selectedWorkspace.ten}</span>
                                {selectedWorkspace.primary_domain ? ` - ${selectedWorkspace.primary_domain}` : ""}
                            </div>
                        ) : null}
                    </div>

                    {selectedWorkspaceId ? (
                        <WorkspaceSettingsPanel workspaceId={selectedWorkspaceId} />
                    ) : (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                            Chọn một workspace để bắt đầu cấu hình tenant.
                        </div>
                    )}
                </div>
            )}

            <Modal
                open={open}
                title={editing ? "Cập nhật workspace" : "Tạo workspace"}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={saving}
                okText={editing ? "Cập nhật" : "Tạo mới"}
                cancelText="Đóng"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{status: "active"}}
                >
                    <Form.Item
                        label="Mã workspace"
                        name="code"
                        rules={[{required: true, message: "Nhập mã workspace"}]}
                    >
                        <Input disabled={Boolean(editing)} />
                    </Form.Item>
                    <Form.Item
                        label="Tên workspace"
                        name="ten"
                        rules={[{required: true, message: "Nhập tên workspace"}]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[{required: true, message: "Nhập slug"}]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Domain"
                        name="domain"
                        rules={[{required: true, message: "Nhập domain"}]}
                    >
                        <Input placeholder="vd: localhost hoặc demo.example.com" />
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{required: true, message: "Chọn trạng thái"}]}
                    >
                        <Select
                            options={[
                                {label: "Hoạt động", value: "active"},
                                {label: "Tạm dừng", value: "inactive"},
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
