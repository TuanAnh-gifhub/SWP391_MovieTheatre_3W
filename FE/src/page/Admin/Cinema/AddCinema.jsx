import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import { HomeOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { createCinema, getAllCities } from "../../../service/cinema";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";

const AddCinema = ({ onSuccess, onClose }) => {
  const [form] = Form.useForm();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllCities().then((response) => {
      if (response.success && Array.isArray(response.data)) {
        setCities(response.data);
      }
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await createCinema({
        name: values.name?.trim(),
        address: values.address?.trim(),
        cityId: Number(values.cityId),
      });

      if (response.success) {
        showSuccessToast(response.message || "Them rap phim thanh cong");
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        showErrorToast(response.message || "Them rap phim that bai");
      }
    } catch (error) {
      showErrorToast(error?.response?.data?.message || error?.message || "Them rap phim that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Form form={form} layout="vertical" className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <HomeOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thong tin rap phim</h3>
          </div>

          <Form.Item
            label="Ten rap"
            name="name"
            rules={[{ required: true, message: "Vui long nhap ten rap" }]}
            className="mb-2"
          >
            <Input placeholder="Nhap ten rap phim" className="rounded-lg" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Dia chi"
            name="address"
            rules={[{ required: true, message: "Vui long nhap dia chi" }]}
            className="mb-2"
          >
            <Input.TextArea placeholder="Nhap dia chi" rows={3} className="rounded-lg" maxLength={255} />
          </Form.Item>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <EnvironmentOutlined className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thanh pho</h3>
          </div>

          <Form.Item
            label="Chon thanh pho"
            name="cityId"
            rules={[{ required: true, message: "Vui long chon thanh pho" }]}
            className="mb-2"
          >
            <Select
              placeholder="Chon thanh pho"
              options={cities.map((city) => ({ label: city.name, value: city.cityId }))}
            />
          </Form.Item>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Dang them..." : "Them rap phim"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AddCinema;

