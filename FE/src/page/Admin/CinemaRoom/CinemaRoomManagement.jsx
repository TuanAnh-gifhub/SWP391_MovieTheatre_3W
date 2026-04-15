import React, { useEffect, useState } from "react";
import { Modal, Tooltip, Button } from "antd";
import { getAllCinemaRooms, setActiveCinemaRoom, deleteCinemaRoom } from "../../../service/cinemaroom";
import MultiSwitch from "../Movie/Switch";
import AddCinemaRoom from "./AddCinemaRoom";
import EditCinemaRoom from "./EditCinemaRoom";
import { EditOutlined, DeleteOutlined, VideoCameraOutlined, EyeOutlined, PlusOutlined, InboxOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const CinemaRoomManagement = ({ addModalVisible, setAddModalVisible }) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [switchLoading, setSwitchLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  // Use props if provided, otherwise use local state
  const modalVisible = addModalVisible !== undefined ? addModalVisible : showAdd;
  const setModalVisible = setAddModalVisible !== undefined ? setAddModalVisible : setShowAdd;
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Thêm state cho popup xác nhận xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  // Thêm state cho filter, search, chọn nhiều, theme
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null: tất cả, true: hoạt động, false: đã tắt
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [theme, setTheme] = useState(document.body.getAttribute('data-theme') || 'light');
  // Theo dõi theme thay đổi
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const [allRooms, setAllRooms] = useState([]);

  const fetchRooms = async ({ page = 1, pageSize = 8, search = searchText, status = statusFilter } = {}) => {
    setLoading(true);
    try {
    const response = await getAllCinemaRooms();
    if (response.success && Array.isArray(response.data)) {
        let all = response.data;
        setAllRooms(all);
        
        // Filter by search
        if (search) {
          all = all.filter(room => 
            room.roomName?.toLowerCase().includes(search.toLowerCase()) ||
            room.name?.toLowerCase().includes(search.toLowerCase()) ||
            room.address?.toLowerCase().includes(search.toLowerCase()) ||
            room.city?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        // Filter by status
        if (typeof status === "boolean") {
          all = all.filter(room => room.status === status);
        }
        
      setPagination({
        current: page,
        pageSize,
          total: all.length,
      });
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setRooms(all.slice(startIdx, endIdx));
    } else {
        setRooms([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        showErrorToast(response.message || "Không lấy được danh sách phòng chiếu");
      }
    } catch (err) {
      showErrorToast("Mất kết nối server");
      setRooms([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRooms({ page: 1, pageSize: pagination.pageSize, search: searchText, status: statusFilter });
  }, [searchText, statusFilter]);

  const handleTableChange = (newPagination) => {
    fetchRooms({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Hàm gọi khi xác nhận xóa
  const handleDeleteConfirm = async () => {
    if (!selectedRoom) return;
    try {
    const res = await deleteCinemaRoom(selectedRoom.cinemaRoomId);
    if (res.success) {
        showSuccessToast(res.message || "Xóa phòng chiếu thành công!");
      fetchRooms({ page: pagination.current, pageSize: pagination.pageSize });
    } else {
        showErrorToast(res.message || "Xóa phòng chiếu thất bại!");
      }
    } catch (err) {
      showErrorToast("Mất kết nối server");
    }
    setDeleteModalVisible(false);
    setSelectedRoom(null);
  };

  // Statistics
  const totalRooms = allRooms.length;
  const activeRooms = allRooms.filter(r => r.status).length;
  const inactiveRooms = allRooms.filter(r => !r.status).length;



  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === null 
              ? 'border-blue-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-blue-300 hover:z-10'
          }`}
          onClick={() => setStatusFilter(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng phòng chiếu</p>
              <p className="text-lg font-bold text-blue-900">{totalRooms}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <VideoCameraOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === true 
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => setStatusFilter(statusFilter === true ? null : true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-lg font-bold text-green-700">{activeRooms}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusFilter === false 
              ? 'border-red-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-red-300 hover:z-10'
          }`}
          onClick={() => setStatusFilter(statusFilter === false ? null : false)}
        >
          <div className="flex items-center justify-between">
    <div>
              <p className="text-xs font-medium text-gray-600">Ngừng hoạt động</p>
              <p className="text-lg font-bold text-red-700">{inactiveRooms}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

            {/* Search Section */}
      <div className="flex items-center justify-end gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <input
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
            style={{ color: 'black', backgroundColor: 'white' }}
          />
        </div>
      </div>

        {/* Room Cards */}
        {rooms.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
            <InboxOutlined className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phòng chiếu nào</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm phòng chiếu mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room, idx) => {
              const stt = (pagination.current - 1) * pagination.pageSize + idx + 1;
              return (
                <div
                  key={room.cinemaRoomId}
                  className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-blue-300"
                >
                  {/* Header */}
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                    <div className="flex items-center gap-2">
                      <VideoCameraOutlined className="text-blue-600" />
                      <span className="font-bold text-blue-700">{room.roomName}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.status 
                        ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                        : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                    }`}>
                      {room.status ? 'Hoạt động' : 'Ngừng'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 bg-gradient-to-br from-white to-blue-50">
                    {/* Room Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Rạp:</span>
                        <span className="text-blue-700 font-bold">{room.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Địa chỉ:</span>
                        <span className="text-gray-700">{room.address}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Thành phố:</span>
                        <span className="text-gray-700">{room.city}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Số ghế:</span>
                        <span className="text-green-700 font-bold">{room.seatQuantity}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 mb-2">
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          size="small"
                          icon={<EditOutlined className="text-blue-600" />}
                          onClick={() => {
                            setSelectedRoom(room);
                            setEditModalVisible(true);
                          }}
                          className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                        />
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <Button
                          size="small"
                          icon={<DeleteOutlined className="text-red-600" />}
                          onClick={() => {
                            setSelectedRoom(room);
                            setDeleteModalVisible(true);
                          }}
                          className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                        />
                      </Tooltip>
                    </div>

                    {/* Status Toggle */}
                    <div className="pt-2 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Trạng thái:</span>
                        <MultiSwitch
                          checked={room.status}
                          checkedChildren="Bật"
                          unCheckedChildren="Tắt"
                          loading={switchLoading}
                          onChange={async (checked) => {
                            setSwitchLoading(true);
                            try {
                              const res = await setActiveCinemaRoom(room.cinemaRoomId, checked);
                              if (res.success) {
                                showSuccessToast(res.message || "Cập nhật trạng thái thành công!");
                                fetchRooms({ page: pagination.current, pageSize: pagination.pageSize });
                              } else {
                                showErrorToast(res.message || "Cập nhật trạng thái thất bại!");
                              }
                            } catch (err) {
                              showErrorToast("Mất kết nối server");
                            } finally {
                              setSwitchLoading(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Pagination */}
        <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
          <button
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            disabled={pagination.current === 1}
            onClick={() => {
              if (pagination.current > 1) {
                const newPage = pagination.current - 1;
                setPagination(prev => ({ ...prev, current: newPage }));
                fetchRooms({ page: newPage, pageSize: pagination.pageSize });
              }
            }}
          >
            &lt;
          </button>
          {Array.from({ length: Math.ceil(allRooms.length / pagination.pageSize) }, (_, i) => i + 1).map(page => (
        <button
              key={page}
              className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
                ${pagination.current === page
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white scale-105'
                  : 'bg-white text-blue-700 hover:bg-blue-100'}
              `}
              onClick={() => {
                setPagination(prev => ({ ...prev, current: page }));
                fetchRooms({ page: page, pageSize: pagination.pageSize });
              }}
            >
              {page}
        </button>
          ))}
        <button
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === Math.ceil(allRooms.length / pagination.pageSize) || allRooms.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            disabled={pagination.current === Math.ceil(allRooms.length / pagination.pageSize) || allRooms.length === 0}
            onClick={() => {
              if (pagination.current < Math.ceil(allRooms.length / pagination.pageSize)) {
                const newPage = pagination.current + 1;
                setPagination(prev => ({ ...prev, current: newPage }));
                fetchRooms({ page: newPage, pageSize: pagination.pageSize });
              }
            }}
          >
            &gt;
          </button>
          <select
            className="ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white text-blue-700 border-blue-200"
            value={pagination.pageSize}
            onChange={e => {
              const newSize = Number(e.target.value);
              setPagination(prev => ({ ...prev, pageSize: newSize, current: 1 }));
              fetchRooms({ page: 1, pageSize: newSize });
            }}
          >
            {[8, 16, 32].map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>

        {/* Modals */}
        <Modal
          title="Thêm phòng chiếu mới"
                      open={modalVisible}
            onCancel={() => setModalVisible(false)}
          footer={null}
          width={500}
          className="!rounded-xl"
        >
          <AddCinemaRoom
            onSuccess={() => {
              setModalVisible(false);
              fetchRooms({ page: pagination.current, pageSize: pagination.pageSize });
            }}
                          onClose={() => setModalVisible(false)}
          />
        </Modal>
        
        <Modal
          title="Chỉnh sửa phòng chiếu"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedRoom(null);
          }}
          footer={null}
          width={500}
          className="!rounded-xl"
        >
          <EditCinemaRoom
            room={selectedRoom}
            onSuccess={() => {
              setEditModalVisible(false);
              setSelectedRoom(null);
              fetchRooms({ page: pagination.current, pageSize: pagination.pageSize });
            }}
            onClose={() => {
              setEditModalVisible(false);
              setSelectedRoom(null);
            }}
          />
        </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedRoom(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
          className="!rounded-xl"
      >
        <p>
          Bạn có chắc chắn muốn xóa phòng chiếu "{selectedRoom?.roomName}"?
        </p>
        <p className="text-red-500 font-medium">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
      </>
  );
};

export default CinemaRoomManagement;