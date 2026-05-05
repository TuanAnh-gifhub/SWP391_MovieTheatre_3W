import React, { useState } from "react";
import { Button } from "antd";
import { 
  HomeOutlined, 
  ShopOutlined,
  UserOutlined, 
  CalendarOutlined, 
  PlayCircleOutlined, 
  PlusOutlined 
} from "@ant-design/icons";
import CinemaManagement from "../Cinema/CinemaManagement";
import CinemaRoomManagement from "../CinemaRoom/CinemaRoomManagement";
import SeatManagement from "../Seat/SeatManagement";
import CalendarManagement from "../Calendar/CalendarManagement";
import ShowTimeManagement from "../ShowTime/ShowTimeManagement";

const TheaterManagement = () => {
  const [activeTab, setActiveTab] = useState("cinema");
  
  // Modal states for each component
  const [cinemaModalVisible, setCinemaModalVisible] = useState(false);
  const [cinemaRoomModalVisible, setCinemaRoomModalVisible] = useState(false);
  const [seatModalVisible, setSeatModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [showTimeModalVisible, setShowTimeModalVisible] = useState(false);

  const tabs = [
    {
      key: "cinema",
      label: "Quan ly rap phim",
      icon: <ShopOutlined className="text-xl text-white" />,
      component: <CinemaManagement addModalVisible={cinemaModalVisible} setAddModalVisible={setCinemaModalVisible} />,
      header: {
        title: "Quan ly rap phim",
        subtitle: "Quan ly danh sach rap phim",
        bgColor: "from-cyan-500 to-blue-600",
        headerBg: "bg-cyan-50",
        borderColor: "border-cyan-200",
        buttonColor: "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
        activeRingColor: "ring-cyan-500",
        activeBorderColor: "border-cyan-400"
      }
    },
    {
      key: "cinemaroom",
      label: "Quản lý phòng chiếu",
      icon: <HomeOutlined className="text-xl text-white" />,
      component: <CinemaRoomManagement addModalVisible={cinemaRoomModalVisible} setAddModalVisible={setCinemaRoomModalVisible} />,
      header: {
        title: "Quản lý phòng chiếu",
        subtitle: "Quản lý các phòng chiếu phim",
        bgColor: "from-blue-500 to-indigo-600",
        headerBg: "bg-blue-50",
        borderColor: "border-blue-200",
        buttonColor: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        activeRingColor: "ring-blue-500",
        activeBorderColor: "border-blue-400"
      }
    },
    {
      key: "seat",
      label: "Quản lý ghế",
      icon: <UserOutlined className="text-xl text-white" />,
      component: <SeatManagement addModalVisible={seatModalVisible} setAddModalVisible={setSeatModalVisible} />,
      header: {
        title: "Quản lý ghế",
        subtitle: "Quản lý ghế ngồi trong phòng chiếu",
        bgColor: "from-green-500 to-emerald-600",
        headerBg: "bg-green-50",
        borderColor: "border-green-200",
        buttonColor: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
        activeRingColor: "ring-green-500",
        activeBorderColor: "border-green-400"
      }
    },
    {
      key: "calendar",
      label: "Quản lý lịch chiếu",
      icon: <CalendarOutlined className="text-xl text-white" />,
      component: <CalendarManagement addModalVisible={calendarModalVisible} setAddModalVisible={setCalendarModalVisible} />,
      header: {
        title: "Quản lý lịch chiếu",
        subtitle: "Quản lý lịch chiếu phim theo ngày",
        bgColor: "from-purple-500 to-violet-600",
        headerBg: "bg-purple-50",
        borderColor: "border-purple-200",
        buttonColor: "from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
        activeRingColor: "ring-purple-500",
        activeBorderColor: "border-purple-400"
      }
    },
    {
      key: "showtime",
      label: "Quản lý suất chiếu",
      icon: <PlayCircleOutlined className="text-xl text-white" />,
      component: <ShowTimeManagement />,
      header: {
        title: "Quản lý suất chiếu",
        subtitle: "Quản lý các suất chiếu phim",
        bgColor: "from-orange-500 to-red-600",
        headerBg: "bg-orange-50",
        borderColor: "border-orange-200",
        buttonColor: "from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
        activeRingColor: "ring-orange-500",
        activeBorderColor: "border-orange-400"
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
        case "cinema":
          setCinemaModalVisible(true);
          break;
        case "cinemaroom":
          setCinemaRoomModalVisible(true);
          break;
        case "seat":
          setSeatModalVisible(true);
          break;
        case "calendar":
          setCalendarModalVisible(true);
          break;
        case "showtime":
          setShowTimeModalVisible(true);
          break;
        default:
          break;
      }
    }, 100);
  };

  return (
    <div>
      {/* Header Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
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
              {/* Ẩn nút + ở tab Quản lý suất chiếu */}
              {tab.key !== "showtime" && (
                <div className="flex-shrink-0">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={(e) => handleAddClick(e, tab.key)}
                    className={`bg-gradient-to-r ${tab.header.buttonColor} border-0 shadow-md hover:shadow-lg transition-all duration-300`}
                  />
                </div>
              )}
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

export default TheaterManagement;