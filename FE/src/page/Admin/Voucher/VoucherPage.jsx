import React, { useState } from "react";
import Coupon from "./Coupon/Coupon";
import { GiftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

const VoucherPage = () => {
  const [couponModalVisible, setCouponModalVisible] = useState(false);

  const handleAddClick = (e) => {
    e.stopPropagation();
    setCouponModalVisible(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg shadow-md border border-blue-200 p-4 transition-all duration-300 hover:shadow-lg relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <GiftOutlined className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 line-clamp-1">Quản lý khuyến mãi (Coupon)</h1>
                <p className="text-xs text-gray-600 line-clamp-1">Quản lý mã giảm giá và khuyến mãi</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={handleAddClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <Coupon addModalVisible={couponModalVisible} setAddModalVisible={setCouponModalVisible} />
      </div>
    </div>
  );
};

export default VoucherPage;