import React, { useState } from "react";
import Coupon from "./Coupon/Coupon";
import PromotionManagement from "./Promotion/PromotionManagement";
import GroupCodeManagement from "./Promotion/GroupCodeManagement";
import { GiftOutlined, TagOutlined, PercentageOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

const VoucherPage = () => {
  const [activeTab, setActiveTab] = useState("coupon");
  
  // Modal states for each component
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [groupCodeModalVisible, setGroupCodeModalVisible] = useState(false);

  const tabs = [
    {
      key: "coupon",
      label: "Quản lý khuyến mãi (Coupon)",
      icon: <GiftOutlined className="text-xl text-white" />,
      component: <Coupon addModalVisible={couponModalVisible} setAddModalVisible={setCouponModalVisible} />,
      header: {
        title: "Quản lý khuyến mãi (Coupon)",
        subtitle: "Quản lý mã giảm giá và khuyến mãi",
        bgColor: "from-blue-500 to-indigo-600",
        headerBg: "bg-blue-50",
        borderColor: "border-blue-200",
        buttonColor: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        activeRingColor: "ring-blue-500",
        activeBorderColor: "border-blue-400"
      }
    },
    {
      key: "promotion",
      label: "Quản lý khuyến mãi (Promotion)",
      icon: <GiftOutlined className="text-xl text-white" />,
      component: <PromotionManagement addModalVisible={promotionModalVisible} setAddModalVisible={setPromotionModalVisible} />,
      header: {
        title: "Quản lý khuyến mãi (Promotion)",
        subtitle: "Quản lý chương trình khuyến mãi và ưu đãi",
        bgColor: "from-pink-500 to-rose-600",
        headerBg: "bg-pink-50",
        borderColor: "border-pink-200",
        buttonColor: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
        activeRingColor: "ring-pink-500",
        activeBorderColor: "border-pink-400"
      }
    },
    {
      key: "groupcode",
      label: "Quản lý nhóm khuyến mãi",
      icon: <TagOutlined className="text-xl text-white" />,
      component: <GroupCodeManagement addModalVisible={groupCodeModalVisible} setAddModalVisible={setGroupCodeModalVisible} />,
      header: {
        title: "Quản lý nhóm khuyến mãi",
        subtitle: "Quản lý nhóm mã khuyến mãi và phân loại",
        bgColor: "from-green-500 to-emerald-600",
        headerBg: "bg-green-50",
        borderColor: "border-green-200",
        buttonColor: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
        activeRingColor: "ring-green-500",
        activeBorderColor: "border-green-400"
      }
    }
  ];

  const currentTab = tabs.find(tab => tab.key === activeTab);

  // Function to handle add button clicks
  const handleAddClick = (e, tabKey) => {
    e.stopPropagation();
    
    // Switch to the tab first, then open modal
    setActiveTab(tabKey);
    
    // Small delay to ensure tab switch completes
    setTimeout(() => {
      switch (tabKey) {
        case "coupon":
          setCouponModalVisible(true);
          break;
        case "promotion":
          setPromotionModalVisible(true);
          break;
        case "groupcode":
          setGroupCodeModalVisible(true);
          break;
        default:
          break;
      }
    }, 100);
  };

  return (
    <div>
      {/* Header Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`${tab.header.headerBg} rounded-lg shadow-md border ${tab.header.borderColor} p-4 cursor-pointer transition-all duration-300 hover:shadow-lg relative ${
              activeTab === tab.key
                ? `ring-2 ${tab.header.activeRingColor} ring-opacity-50 ${tab.header.activeBorderColor} transform scale-105 z-10`
                : 'hover:scale-105 hover:z-10'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${tab.header.bgColor} rounded-lg flex items-center justify-center shadow-md`}>
                  {tab.icon}
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 line-clamp-1">{tab.header.title}</h1>
                  <p className="text-xs text-gray-600 line-clamp-1">{tab.header.subtitle}</p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={(e) => handleAddClick(e, tab.key)}
                  className={`bg-gradient-to-r ${tab.header.buttonColor} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div>
        {currentTab?.component}
      </div>
    </div>
  );
};

export default VoucherPage;