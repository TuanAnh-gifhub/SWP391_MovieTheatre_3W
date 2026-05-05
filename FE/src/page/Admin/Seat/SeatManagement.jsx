import React, { useEffect, useState } from "react";
import { Modal, Tooltip, Button, Select } from "antd";
import { getAllSeats, toggleSeatAvailability, getAllSeatTypes, updateSeatTypeBatch } from "../../../service/seat";
import AddSeat from "./AddSeat";
import EditSeat from "./EditSeat";
import { HomeOutlined, InboxOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";

const normalizeSeatType = (seatType) =>
  String(seatType || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const isVipSeat = (seatType) => normalizeSeatType(seatType).includes("vip");
const isDoubleSeat = (seatType) => {
  const normalized = normalizeSeatType(seatType);
  return normalized.includes("double") || normalized.includes("doi");
};
const getSeatFillClass = (seatType) => {
  if (isVipSeat(seatType)) return "bg-yellow-200 text-yellow-900 shadow-[0_0_8px_2px_rgba(255,193,7,0.3)]";
  if (isDoubleSeat(seatType)) return "bg-purple-200 text-purple-900 shadow-[0_0_8px_2px_rgba(168,85,247,0.25)]";
  return "bg-gray-200 text-gray-700";
};
const getSeatTypeLabel = (seatType) => {
  if (isVipSeat(seatType)) return "VIP";
  if (isDoubleSeat(seatType)) return "Ghế đôi";
  return seatType || "Thường";
};

const SeatManagement = ({ addModalVisible, setAddModalVisible }) => {
  const [seatData, setSeatData] = useState([]);
  const [flatSeats, setFlatSeats] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
    total: 0,
  });
  const [showAdd, setShowAdd] = useState(false);
  // Use props if provided, otherwise use local state
  const modalVisible = addModalVisible !== undefined ? addModalVisible : showAdd;
  const setModalVisible = setAddModalVisible !== undefined ? setAddModalVisible : setShowAdd;
  const [showEdit, setShowEdit] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedRoomForAdd, setSelectedRoomForAdd] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [showSeatActionModal, setShowSeatActionModal] = useState(false);
  const [selectedSeatsByRoom, setSelectedSeatsByRoom] = useState({});
  const [selectedActionRoom, setSelectedActionRoom] = useState(null);
  const [selectedSeatsForAction, setSelectedSeatsForAction] = useState([]);
  const [selectedSeatTypeId, setSelectedSeatTypeId] = useState("");
  const [selectedSeatPrice, setSelectedSeatPrice] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Lấy dữ liệu ghế và flatten để dễ render
  const fetchSeats = async ({ page = 1, pageSize = 6, search = searchText, city = cityFilter, cinema = cinemaFilter, room = roomFilter } = {}) => {
    try {
      const res = await getAllSeats();
      if (res.success) {
        setSeatData(res.data);
        
        // Flatten dữ liệu để dễ filter và render
        const seats = [];
        const rooms = [];
        res.data.forEach(city => {
          city.cinemas.forEach(cinema => {
            cinema.cinemaRooms.forEach(room => {
              rooms.push({
                ...room,
                cityName: city.name,
                cinemaName: cinema.name,
              });
              room.seats.forEach(seat => {
                seats.push({
                  cityID: city.cityID,
                  cityName: city.name,
                  cinemaID: cinema.cinemaID,
                  cinemaName: cinema.name,
                  cinemaRoomID: room.cinemaRoomID,
                  roomName: room.roomName,
                  seatID: seat.seatID,
                  seatName: seat.seatName,
                  seatType: seat.seatType,
                  isAvailable: seat.isAvailable,
                  price: seat.price,
                });
              });
            });
          });
        });
        setFlatSeats(seats);
        setAllRooms(rooms);
        
        // Filter rooms based on search and filters
        let filteredRooms = rooms;
        
        if (search) {
          filteredRooms = filteredRooms.filter(room => 
            room.roomName?.toLowerCase().includes(search.toLowerCase()) ||
            room.cityName?.toLowerCase().includes(search.toLowerCase()) ||
            room.cinemaName?.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (city && city !== "") {
          // Filter theo cityName vì cityID trong rooms là undefined
          const selectedCity = seatData.find(c => c.cityID === Number(city));
          if (selectedCity) {
            filteredRooms = filteredRooms.filter(room => room.cityName === selectedCity.name);
          }
        }
        
        if (cinema && cinema !== "") {
          const selectedCinema = seatData
            .find(city => city.cityID === Number(cityFilter))
            ?.cinemas.find(c => c.cinemaID === Number(cinema));
          if (selectedCinema) {
            filteredRooms = filteredRooms.filter(room => room.cinemaName === selectedCinema.name);
          }
        }
        
        if (room && room !== "") {
          const selectedRoom = seatData
            .find(city => city.cityID === Number(cityFilter))
            ?.cinemas.find(cinema => cinema.cinemaID === Number(cinemaFilter))
            ?.cinemaRooms.find(r => r.cinemaRoomID === Number(room));
          if (selectedRoom) {
            filteredRooms = filteredRooms.filter(room => room.roomName === selectedRoom.roomName);
          }
        }



        
        setPagination({
          current: page,
          pageSize: pageSize,
          total: filteredRooms.length,
        });
        
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        setFilteredRooms(filteredRooms.slice(startIdx, endIdx));
      } else {
        showErrorToast(res.message || "Không thể lấy danh sách ghế");
        setFlatSeats([]);
        setAllRooms([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      showErrorToast("Mất kết nối server");
      setFlatSeats([]);
      setAllRooms([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    const fetchSeatTypes = async () => {
      const res = await getAllSeatTypes();
      if (res.success) {
        setSeatTypes(Array.isArray(res.data) ? res.data : []);
      }
    };
    fetchSeatTypes();
  }, []);

  useEffect(() => {
    fetchSeats({ page: 1, pageSize: pagination.pageSize, search: searchText, city: cityFilter, cinema: cinemaFilter, room: roomFilter });
  }, [searchText, cityFilter, cinemaFilter, roomFilter]);

  // Reset selectedRoomForAdd when modal is closed
  useEffect(() => {
    if (!modalVisible) {
      setSelectedRoomForAdd(null);
    }
  }, [modalVisible]);

  const [filteredRooms, setFilteredRooms] = useState([]);

  // Statistics
  const totalSeats = flatSeats.length;
  const availableSeats = flatSeats.filter(seat => seat.isAvailable).length;
  const unavailableSeats = flatSeats.filter(seat => !seat.isAvailable).length;
  const totalRooms = allRooms.length;

  // Lấy options cho filter
  const cityOptions = seatData.map(city => ({
    value: city.cityID,
    label: city.name,
  }));

  // Alternative: Tạo cityOptions từ allRooms nếu seatData trống
  const cityOptionsFromRooms = allRooms.length > 0 ? 
    [...new Set(allRooms.map(room => ({ value: room.cityID, label: room.cityName })))] : [];

  const finalCityOptions = cityOptions.length > 0 ? cityOptions : cityOptionsFromRooms;



  const cinemaOptions = cityFilter
    ? seatData
        .find(city => city.cityID === Number(cityFilter))
        ?.cinemas.map(cinema => ({
          value: cinema.cinemaID,
          label: cinema.name,
        })) || []
    : [];

  const roomOptions = cinemaFilter
    ? seatData
        .find(city => city.cityID === Number(cityFilter))
        ?.cinemas.find(cinema => cinema.cinemaID === Number(cinemaFilter))
        ?.cinemaRooms.map(room => ({
          value: room.cinemaRoomID,
          label: room.roomName,
        })) || []
    : [];



  // Handle seat toggle
  const handleSeatToggle = async (seat) => {
    try {
      const res = await toggleSeatAvailability([seat.seatID]);
      if (res.success) {
        showSuccessToast(res.message || "Cập nhật trạng thái ghế thành công!");
        fetchSeats({ page: pagination.current, pageSize: pagination.pageSize });
      } else {
        showErrorToast(res.message || "Cập nhật trạng thái ghế thất bại!");
      }
    } catch (err) {
      showErrorToast("Mất kết nối server");
    }
  };

  const resolveSeatTypeId = (seatTypeLabel) => {
    if (!seatTypeLabel) return "";
    const found = seatTypes.find(
      (type) =>
        type.code?.toLowerCase() === String(seatTypeLabel).toLowerCase() ||
        type.name?.toLowerCase() === String(seatTypeLabel).toLowerCase()
    );
    return found?.seatTypeID || "";
  };

  const getRoomSelection = (roomId) => selectedSeatsByRoom[String(roomId)] || [];

  const extractSeatPosition = (seatName) => {
    const match = String(seatName || "").trim().match(/^([A-Za-z]+)(\d+)$/);
    if (!match) return null;
    return { row: match[1].toUpperCase(), col: Number(match[2]) };
  };

  const isDoubleTargetType = (seatTypeId) => {
    const chosen = seatTypes.find((type) => type.seatTypeID === Number(seatTypeId));
    if (!chosen) return false;
    return isDoubleSeat(chosen.code) || isDoubleSeat(chosen.name);
  };

  const validateHorizontalAdjacentIgnoringGap = (selectedSeats) => {
    if (selectedSeats.length !== 2) return false;

    const first = extractSeatPosition(selectedSeats[0].seatName);
    const second = extractSeatPosition(selectedSeats[1].seatName);
    return !!first && !!second && first.row === second.row && Math.abs(first.col - second.col) === 1;
  };

  const toggleSeatSelection = (seat, room) => {
    const roomKey = String(room.cinemaRoomID);
    setSelectedSeatsByRoom((prev) => {
      const current = prev[roomKey] || [];
      const exists = current.some((item) => item.seatID === seat.seatID);
      const next = exists
        ? current.filter((item) => item.seatID !== seat.seatID)
        : [
            ...current,
            {
              ...seat,
              roomName: room.roomName,
              cinemaRoomID: room.cinemaRoomID,
            },
          ];
      return { ...prev, [roomKey]: next };
    });
  };

  const openSeatAction = (room) => {
    const selectedSeats = getRoomSelection(room.cinemaRoomID);
    if (selectedSeats.length === 0) {
      showErrorToast("Vui lòng chọn ít nhất 1 ghế để chỉnh sửa");
      return;
    }

    const firstSeat = selectedSeats[0];
    setSelectedActionRoom(room);
    setSelectedSeatsForAction(selectedSeats);
    setSelectedSeatTypeId(resolveSeatTypeId(firstSeat.seatType));
    setSelectedSeatPrice(firstSeat.price || 0);
    setShowSeatActionModal(true);
  };

  const handleSaveSeatType = async () => {
    if (!selectedActionRoom || selectedSeatsForAction.length === 0) return;
    if (!selectedSeatTypeId) {
      showErrorToast("Vui lòng chọn loại ghế");
      return;
    }
    if (Number(selectedSeatPrice) < 0) {
      showErrorToast("Giá ghế không hợp lệ");
      return;
    }

    setActionLoading(true);
    try {
      const chosenType = seatTypes.find((t) => t.seatTypeID === Number(selectedSeatTypeId));

      if (isDoubleTargetType(selectedSeatTypeId)) {
        if (selectedSeatsForAction.length !== 2) {
          showErrorToast("Khi đổi sang ghế đôi, bạn phải chọn đúng 2 ghế");
          return;
        }
        if (!validateHorizontalAdjacentIgnoringGap(selectedSeatsForAction)) {
          showErrorToast("2 ghế đôi phải cùng hàng và có số ghế liền kề (ví dụ C1 + C2)");
          return;
        }
      }

      const res = await updateSeatTypeBatch({
        cinemaRoomId: Number(selectedActionRoom.cinemaRoomID),
        seatIds: selectedSeatsForAction.map((seat) => seat.seatID),
        seatTypeId: Number(selectedSeatTypeId),
        seatType: chosenType?.code || chosenType?.name,
        price: Number(selectedSeatPrice),
      });

      if (!res.success) {
        showErrorToast(res.message || "Cập nhật loại ghế thất bại");
        return;
      }

      showSuccessToast(`Đã cập nhật loại ghế thành công cho ${selectedSeatsForAction.length} ghế`);
      setShowSeatActionModal(false);
      setSelectedSeatsByRoom((prev) => ({
        ...prev,
        [String(selectedActionRoom.cinemaRoomID)]: [],
      }));
      setSelectedSeatsForAction([]);
      setSelectedActionRoom(null);
      fetchSeats({ page: pagination.current, pageSize: pagination.pageSize });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng ghế</p>
              <p className="text-lg font-bold text-blue-900">{totalSeats}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <HomeOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-gray-200 hover:border-green-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-lg font-bold text-green-700">{availableSeats}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 border-gray-200 hover:border-red-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đã khóa</p>
              <p className="text-lg font-bold text-red-700">{unavailableSeats}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng phòng</p>
              <p className="text-lg font-bold text-purple-700">{totalRooms}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
              <HomeOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <Select
            placeholder="Tất cả thành phố"
            style={{ width: 180 }}
            value={cityFilter || undefined}
            onChange={v => {
              setCityFilter(v);
              setCinemaFilter("");
              setRoomFilter("");
            }}
            options={[
              { value: "", label: "Tất cả thành phố" },
              ...finalCityOptions,
            ]}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            allowClear={false}
          />
          <Select
            placeholder="Tất cả rạp"
            style={{ width: 180 }}
            value={cinemaFilter}
            onChange={v => {
              setCinemaFilter(v);
              setRoomFilter("");
            }}
            options={[
              { value: "", label: "Tất cả rạp" },
              ...cinemaOptions,
            ]}
            allowClear={false}
            disabled={!cityFilter && cinemaOptions.length === 0}
          />
          <Select
            placeholder="Tất cả phòng chiếu"
            style={{ width: 180 }}
            value={roomFilter}
            onChange={setRoomFilter}
            options={[
              { value: "", label: "Tất cả phòng chiếu" },
              ...roomOptions,
            ]}
            allowClear={false}
            disabled={!cinemaFilter && roomOptions.length === 0}
          />
        </div>
        
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <input
            placeholder="Tìm kiếm ghế..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-10 w-64 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
            style={{ color: 'black', backgroundColor: 'white' }}
          />
        </div>
      </div>
      {/* Room Cards */}
      {filteredRooms.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phòng chiếu nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm ghế mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.cinemaRoomID} className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-blue-300">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                <div className="flex items-center gap-2">
                  <HomeOutlined className="text-blue-600" />
                  <span className="font-bold text-blue-700">{room.roomName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-blue-600 font-medium">
                    {room.seats.length} ghế
                  </div>
                  <Tooltip title="Cập nhật ghế đã chọn">
                    <Button
                      size="small"
                      onClick={() => openSeatAction(room)}
                      disabled={getRoomSelection(room.cinemaRoomID).length === 0}
                    >
                      Sửa ({getRoomSelection(room.cinemaRoomID).length})
                    </Button>
                  </Tooltip>
                  <Tooltip title="Thêm ghế cho phòng này">
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedRoomForAdd(room);
                        setModalVisible(true);
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-gradient-to-br from-white to-blue-50">
                {/* Room Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Rạp:</span>
                    <span className="text-blue-700 font-bold">{room.cinemaName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Thành phố:</span>
                    <span className="text-gray-700">{room.cityName}</span>
                  </div>
                </div>

                {/* Seat Legend */}
                <div className="flex gap-3 mb-4 justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-gray-200 border border-green-400" />
                    <span className="text-xs text-gray-600">Thường</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-yellow-200 border border-yellow-500 shadow-[0_0_8px_2px_rgba(255,193,7,0.3)]" />
                    <span className="text-xs text-gray-600">VIP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-purple-200 border border-purple-500 shadow-[0_0_8px_2px_rgba(168,85,247,0.25)]" />
                    <span className="text-xs text-gray-600">Ghế đôi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-gray-200 border border-red-400 opacity-50" />
                    <span className="text-xs text-gray-600">Khóa</span>
                  </div>
                </div>

                {/* Seat Layout */}
                {room.seats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <InboxOutlined className="text-3xl mb-2" />
                    <div className="text-sm font-medium">Không có ghế nào</div>
                  </div>
                ) : (
                  <div className="w-full">
                    {(() => {
                      const rows = Array.from(new Set(room.seats.map(seat => seat.seatName[0]))).sort();
                      const cols = Array.from(new Set(room.seats.map(seat => Number(seat.seatName.slice(1))))).sort((a,b) => a-b);
                      return (
                        <div className="flex flex-col items-center w-full">
                          {/* Screen */}
                          <div className="text-center text-blue-500 font-bold text-sm mb-2">Màn hình</div>
                          <div className="w-full h-1 rounded-full bg-gradient-to-r from-blue-200 to-blue-400 mb-3" />
                          
                          {/* Seats */}
                          <div className="rounded-lg p-3 shadow border border-blue-100 w-full">
                            {rows.map(row => (
                              <div key={row} className="flex gap-1 mb-1 items-center">
                                <span className="w-3 text-gray-400 text-xs">{row}</span>
                                {cols.map(col => {
                                  const seat = room.seats.find(s => s.seatName === `${row}${col}`);
                                  return seat ? (
                                    <div
                                      key={seat.seatID}
                                      className={`w-8 h-8 flex items-center justify-center rounded font-bold border text-xs cursor-pointer transition-all duration-200
                                        ${getSeatFillClass(seat.seatType)}
                                        ${getRoomSelection(room.cinemaRoomID).some((item) => item.seatID === seat.seatID) ? 'ring-2 ring-blue-500 scale-105' : ''}
                                        ${seat.isAvailable ? 'border-green-400 hover:scale-110 hover:shadow-lg hover:border-blue-400' : 'border-red-400 opacity-50'}
                                      `}
                                      title={`${seat.seatName} - ${getSeatTypeLabel(seat.seatType)} - ${seat.price?.toLocaleString()} đ`}
                                      onClick={() => toggleSeatSelection(seat, room)}
                                    >
                                      {seat.seatName}
                                    </div>
                                  ) : (
                                    <div key={col} className="w-8 h-8" />
                                  );
                                })}
                                <span className="w-3 text-gray-400 text-xs">{row}</span>
                              </div>
                            ))}
                            {/* Column numbers */}
                            <div className="flex gap-1 mt-1 ml-4">
                              {cols.map(col => (
                                <span key={col} className="w-8 text-center text-gray-400 text-xs">{col}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Pagination */}
      <div className="flex flex-wrap justify-end items-center gap-2 mt-6">
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
              fetchSeats({ page: newPage, pageSize: pagination.pageSize });
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
              fetchSeats({ page: page, pageSize: pagination.pageSize });
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
              fetchSeats({ page: newPage, pageSize: pagination.pageSize });
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
            fetchSeats({ page: 1, pageSize: newSize });
          }}
        >
          {[6, 12, 24].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>
      {/* Modals */}
      <Modal
        title="Thêm ghế mới"
        open={modalVisible}
        key={`add-seat-modal-${selectedRoomForAdd?.cinemaRoomID || 'no-room'}`}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRoomForAdd(null); // Reset on cancel
        }}
        onOk={() => {
          // This will never be called since footer={null}, but just in case
          setSelectedRoomForAdd(null);
        }}
        afterClose={() => {
          // Reset when modal is completely closed
          setSelectedRoomForAdd(null);
        }}
        footer={null}
        width={800}
        className="!rounded-xl"
      >
        <AddSeat
          selectedRoom={selectedRoomForAdd}
          onSuccess={() => {
            setModalVisible(false);
            setSelectedRoomForAdd(null); // Reset on success
            fetchSeats({ page: pagination.current, pageSize: pagination.pageSize });
          }}
          onClose={() => {
            setModalVisible(false);
            setSelectedRoomForAdd(null); // Reset on close
          }}
        />
      </Modal>
      
      <Modal
        title="Chỉnh sửa ghế"
        open={showEdit}
        onCancel={() => {
          setShowEdit(false);
          setSelectedSeat(null);
        }}
        footer={null}
        width={500}
        className="!rounded-xl"
      >
        <EditSeat
          seat={selectedSeat}
          onSuccess={() => {
            setShowEdit(false);
            setSelectedSeat(null);
            fetchSeats({ page: pagination.current, pageSize: pagination.pageSize });
          }}
          onClose={() => {
            setShowEdit(false);
            setSelectedSeat(null);
          }}
        />
      </Modal>

      <Modal
        title="Điều chỉnh ghế trong phòng"
        open={showSeatActionModal}
        onCancel={() => {
          setShowSeatActionModal(false);
          setSelectedSeatsForAction([]);
          setSelectedActionRoom(null);
        }}
        footer={null}
        width={520}
      >
        {selectedActionRoom && selectedSeatsForAction.length > 0 && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border bg-gray-50">
              <div className="text-sm text-gray-600">Phòng: <span className="font-semibold text-gray-900">{selectedActionRoom.roomName}</span></div>
              <div className="text-sm text-gray-600">Số ghế đã chọn: <span className="font-semibold text-gray-900">{selectedSeatsForAction.length}</span></div>
              <div className="text-sm text-gray-600">Danh sách ghế: <span className="font-semibold text-gray-900">{selectedSeatsForAction.map((seat) => seat.seatName).join(", ")}</span></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại ghế mới</label>
              <Select
                className="w-full"
                value={selectedSeatTypeId || undefined}
                placeholder="Chọn loại ghế"
                onChange={(value) => {
                  setSelectedSeatTypeId(value);
                  const nextType = seatTypes.find((type) => type.seatTypeID === Number(value));
                  if (nextType?.basePrice != null) {
                    setSelectedSeatPrice(nextType.basePrice);
                  }
                }}
                options={seatTypes.map((type) => ({
                  value: type.seatTypeID,
                  label: `${type.name} (${Number(type.basePrice || 0).toLocaleString("vi-VN")}đ)`,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá ghế</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={selectedSeatPrice}
                onChange={(e) => setSelectedSeatPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={selectedSeatsForAction.length !== 1}
                onClick={async () => {
                  if (selectedSeatsForAction.length !== 1) return;
                  await handleSeatToggle(selectedSeatsForAction[0]);
                  setShowSeatActionModal(false);
                  setSelectedSeatsForAction([]);
                  setSelectedActionRoom(null);
                }}
              >
                {selectedSeatsForAction.length === 1 && selectedSeatsForAction[0].isAvailable ? "Khóa ghế" : "Mở ghế"}
              </Button>
              <Button type="primary" loading={actionLoading} onClick={handleSaveSeatType}>
                Lưu loại ghế
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default SeatManagement;