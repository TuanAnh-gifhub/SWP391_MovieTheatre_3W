import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Upload, Button, Divider } from "antd";
import { UploadOutlined, TrophyOutlined, CrownOutlined, GiftOutlined, PictureOutlined } from "@ant-design/icons";
import { createLoyaltyTier } from "../../../service/loyalty";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const AddLoyalty = ({ visible = true, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  // Xử lý upload ảnh lên server (giả sử có API upload, thay đổi cho phù hợp backend)
  const handleUpload = async (file) => {
    setUploading(true);
    // Giả lập upload, thay bằng API thực tế nếu có
    // Ví dụ: const res = await uploadImageAPI(file);
    // if (res.url) return res.url;
    // else throw new Error("Upload failed");
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập trả về link ảnh
        resolve(URL.createObjectURL(file));
        setUploading(false);
      }, 1000);
    });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let imageUrl = values.rankLink?.trim() || "";
      // Nếu có file upload, ưu tiên file upload
      if (values.rankUpload && values.rankUpload.length > 0 && values.rankUpload[0].originFileObj) {
        imageUrl = await handleUpload(values.rankUpload[0].originFileObj);
      }

      const res = await createLoyaltyTier({
        name: values.name.trim(),
        pointThreshold: Number(values.pointThreshold),
        discountPercent: Number(values.discountPercent),
        rankLink: imageUrl,
      });

      if (res && res.status === 200) {
        showSuccessToast(res.message || "Thêm hạng thành viên thành công!");
        form.resetFields();
        onSuccess && onSuccess();
        onClose && onClose();
      } else {
        showErrorToast(res.message || "Thêm hạng thành viên thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Thêm hạng thành viên thất bại!";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <TrophyOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Thêm hạng thành viên mới</span>
          </div>
        }
        open={visible}
        onOk={handleOk}
        onCancel={() => {
          form.resetFields();
          onClose && onClose();
        }}
        confirmLoading={loading || uploading}
        okText="Thêm hạng"
        cancelText="Hủy"
        destroyOnHidden
        width={700}
        className="!rounded-xl"
        okButtonProps={{
          className: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 border-0 shadow-lg"
        }}
        cancelButtonProps={{
          className: "border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: "",
            pointThreshold: 0,
            discountPercent: 0,
            rankLink: "",
            rankUpload: [],
          }}
          className="mt-2"
        >
          {/* Basic Information Section */}
          <div className="mb-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <CrownOutlined className="text-white text-xs" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Thông tin cơ bản</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Form.Item
                label="Tên hạng"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên hạng" }]}
                className="mb-1"
              >
                <Input 
                  placeholder="Nhập tên hạng, ví dụ: Khách hàng hạng bạc"
                  className="rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Điểm đạt"
                name="pointThreshold"
                rules={[
                  { required: true, message: "Vui lòng nhập điểm đạt" },
                  { type: "number", min: 0, message: "Điểm đạt phải >= 0" },
                ]}
                className="mb-1"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: "100%" }} 
                  placeholder="Nhập điểm đạt, ví dụ: 10"
                  className="rounded-lg border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-3" />

          {/* Discount Information Section */}
          <div className="mb-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <GiftOutlined className="text-white text-xs" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Thông tin giảm giá</h3>
            </div>
            
            <Form.Item
              label="Phần trăm giảm giá (%)"
              name="discountPercent"
              rules={[
                { required: true, message: "Vui lòng nhập phần trăm giảm giá" },
                { type: "number", min: 0, message: "Phần trăm giảm giá phải >= 0" },
              ]}
              className="mb-1"
            >
              <InputNumber 
                min={0} 
                style={{ width: "100%" }} 
                placeholder="Nhập phần trăm giảm giá, ví dụ: 3"
                className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
              />
            </Form.Item>
          </div>

          <Divider className="my-3" />

          {/* Image Section */}
          <div className="mb-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <PictureOutlined className="text-white text-xs" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Hình ảnh hạng</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Form.Item
                label="Link hình ảnh hạng"
                name="rankLink"
                rules={[
                  {
                    validator: (_, value) => {
                      const upload = form.getFieldValue("rankUpload");
                      if ((!value || !value.trim()) && (!upload || upload.length === 0)) {
                        return Promise.reject("Vui lòng nhập link hoặc upload ảnh");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                className="mb-1"
              >
                <Input 
                  placeholder="Dán link hình ảnh hoặc chọn file bên dưới"
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </Form.Item>
              
              <Form.Item
                label="Upload hình ảnh hạng"
                name="rankUpload"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                className="mb-1"
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  listType="picture"
                  className="rounded-lg"
                >
                  <Button 
                    icon={<UploadOutlined />}
                    className="border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 bg-gradient-to-r from-blue-100 to-indigo-100"
                  >
                    Chọn ảnh từ máy
                  </Button>
                </Upload>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddLoyalty;