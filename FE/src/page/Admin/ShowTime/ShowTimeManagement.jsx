import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { getShowtimes, deleteShowtime, onOffShowtime } from '../../../service/showtime';
import MultiSwitch from '../Movie/Switch';
import { Button, Tooltip, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const weekdayLabels = ["CN", "TH 2", "TH 3", "TH 4", "TH 5", "TH 6", "TH 7"];

const ShowTimeManagement = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [cinemaFilter, setCinemaFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [centerDate, setCenterDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState("week");
  const gridRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);

  // Chuyển đổi dữ liệu lồng nhau thành mảng phẳng (thêm toTime)
  const flattenShowtimes = (data) => {
    const result = [];
    data.forEach(city => {
      city.cinemas.forEach(cinema => {
        cinema.cinemaRooms.forEach(room => {
          room.showtimes.forEach(show => {
            show.times.forEach(time => {
              result.push({
                id: time.showtimeID,
                movieTitle: time.movieTitle || '',
                cityName: city.cityName,
                cinemaName: cinema.name,
                cinemaRoom: room.roomName,
                showDate: show.date,
                showTime: time.time,
                toTime: time.toTime, 
                active: time.active,
              });
            });
          });
        });
      });
    });
    return result;
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const response = await getShowtimes();
      if (!response.error) {
        setShowtimes(flattenShowtimes(response.result));
      } else {
        toast.error(response.message || 'Không thể lấy danh sách suất chiếu');
      }
    } catch (error) {
      toast.error('Có lỗi khi lấy danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      setGridWidth(gridRef.current.scrollWidth);
    }
    const handleResize = () => {
      if (gridRef.current) setGridWidth(gridRef.current.scrollWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode, centerDate, showtimes]);

  // Lấy danh sách unique cho các bộ lọc
  const cityOptions = [...new Set(showtimes.map(item => item.cityName))];
  const cinemaOptions = [...new Set(showtimes
    .filter(item => !cityFilter || item.cityName === cityFilter)
    .map(item => item.cinemaName))];
  const roomOptions = [...new Set(showtimes
    .filter(item => (!cityFilter || item.cityName === cityFilter) && (!cinemaFilter || item.cinemaName === cinemaFilter))
    .map(item => item.cinemaRoom))];

  // Lọc dữ liệu theo searchText và các bộ lọc nhanh
  const filteredShowtimes = showtimes.filter(item => {
    const keyword = searchText.toLowerCase();
    const matchSearch =
      item.movieTitle.toLowerCase().includes(keyword) ||
      item.cityName.toLowerCase().includes(keyword) ||
      item.cinemaName.toLowerCase().includes(keyword) ||
      item.cinemaRoom.toLowerCase().includes(keyword) ||
      item.showDate.toLowerCase().includes(keyword) ||
      item.showTime.toLowerCase().includes(keyword);

    const matchCity = !cityFilter || item.cityName === cityFilter;
    const matchCinema = !cinemaFilter || item.cinemaName === cinemaFilter;
    const matchRoom = !roomFilter || item.cinemaRoom === roomFilter;

    return matchSearch && matchCity && matchCinema && matchRoom;
  });

  // Tính toán các ngày hiển thị trên grid
  function getWeekDays(centerDate) {
    const startOfWeek = dayjs(centerDate).startOf("week");
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  }
  function getMonthGridDays(centerDate) {
    const monthStart = dayjs(centerDate).startOf("month");
    const monthEnd = dayjs(centerDate).endOf("month");
    const gridStart = monthStart.startOf("week");
    const gridEnd = monthEnd.endOf("week");
    const days = [];
    let current = gridStart;
    while (current.isSameOrBefore(gridEnd, "day")) {
      days.push(current);
      current = current.add(1, "day");
    }
    return days;
  }
  const days = viewMode === "week" ? getWeekDays(centerDate) : getMonthGridDays(centerDate);
  const gridCols = days.length;

  // Gom suất chiếu theo ngày
  const showtimeByDay = {};
  days.forEach(d => {
    showtimeByDay[d.format("YYYY-MM-DD")] = [];
  });
  filteredShowtimes.forEach(st => {
    const key = dayjs(st.showDate).format("YYYY-MM-DD");
    if (showtimeByDay[key]) showtimeByDay[key].push(st);
  });

  // Gom suất chiếu theo giờ trong ngày (ví dụ 08:00-23:00, mỗi 1 tiếng)
  const timeSlots = [];
  for (let h = 0; h <= 23; h++) {
    timeSlots.push(h.toString().padStart(2, "0") + ":00");
  }

  // Modal xác nhận xóa
  const showDeleteConfirm = (showtime) => {
    setSelectedShowtime(showtime);
    setDeleteModalVisible(true);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedShowtime) return;
    try {
      setLoading(true);
      const response = await deleteShowtime(selectedShowtime.id);
      if (!response.error && (response.status === 200 || response.status === 204)) {
        if (response.result?.failures && response.result.failures.length > 0) {
          response.result.failures.forEach(msg => toast.error(msg));
        } else {
          toast.success('Xóa suất chiếu thành công');
          fetchShowtimes();
        }
      } else {
        toast.error(response.message || 'Có lỗi khi xóa suất chiếu');
      }
    } catch (error) {
      toast.error('Có lỗi khi xóa suất chiếu');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setSelectedShowtime(null);
    }
  };

  return (
    <div className="">
    
      <div className="mb-4 flex items-center gap-2">
        <input
          placeholder="Tìm kiếm phim, rạp, thành phố, ngày, giờ..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            width: 320,
            padding: 6,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: "#fff", // nền trắng
            color: "#222"       // chữ đen
          }}
        />
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          style={{
            width: 150,
            padding: 6,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: "#fff", // nền trắng
            color: "#222"       // chữ đen
          }}
        >
          <option value="">Tất cả thành phố</option>
          {cityOptions.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <select
          value={cinemaFilter}
          onChange={e => setCinemaFilter(e.target.value)}
          style={{
            width: 150,
            padding: 6,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: "#fff", // nền trắng
            color: "#222"       // chữ đen
          }}
        >
          <option value="">Tất cả rạp phim</option>
          {cinemaOptions.map(cinema => (
            <option key={cinema} value={cinema}>{cinema}</option>
          ))}
        </select>
        <select
          value={roomFilter}
          onChange={e => setRoomFilter(e.target.value)}
          style={{
            width: 150,
            padding: 6,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: "#fff", // nền trắng
            color: "#222"       // chữ đen
          }}
        >
          <option value="">Tất cả phòng</option>
          {roomOptions.map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>
        <select
          value={viewMode}
          onChange={e => setViewMode(e.target.value)}
          style={{
            width: 120,
            padding: 6,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: "#fff",
            color: "#222"
          }}
        >
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
        </select>
        <button
          className="rounded-full bg-white shadow border border-gray-200 flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            padding: 0,
            color: "#222" // màu icon đen
          }}
          onClick={() => setCenterDate(centerDate.subtract(viewMode === "week" ? 7 : 30, "day"))}
        >
          <LeftOutlined />
        </button>
        <button
          className="rounded-full bg-white shadow border border-gray-200 flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            padding: 0,
            color: "#222" // màu icon đen
          }}
          onClick={() => setCenterDate(centerDate.add(viewMode === "week" ? 7 : 30, "day"))}
        >
          <RightOutlined />
        </button>
      </div>
      <div className="shadow-md rounded-lg bg-white dark:bg-white overflow-x-auto">
        <div className="p-6 min-w-[1200px]">
          <table style={{ width: "100%", fontSize: 13, minWidth: 200 + gridCols * 220, borderCollapse: "collapse", color: "#222" }}>
            <thead>
              <tr>
                <th
                  style={{
                    width: 70,
                    textAlign: "center",
                    padding: 6,
                    border: "1px solid #eee",
                    background: "transparent",
                    color: "#222"
                  }}
                >
                  Giờ
                </th>
                {days.map((d, idx) => (
                  <th
                    key={d.format("YYYY-MM-DD")}
                    style={{
                      textAlign: "center",
                      padding: 6,
                      border: d.isSame(dayjs(), "day")
                        ? "2px solid #2563eb"
                        : "1px solid #eee",
                      background: d.isSame(dayjs(), "day")
                        ? "#dbeafe"
                        : "transparent",
                      color: d.isSame(dayjs(), "day") ? "#222" : "#222",
                      borderRadius: d.isSame(dayjs(), "day") ? 8 : 0,
                      transition: "all 0.2s"
                    }}
                  >
                    <span className="font-semibold">{weekdayLabels[d.day()]}</span>
                    <br />
                    <span className="font-bold">{d.format("DD/MM")}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot}>
                  <td style={{ textAlign: "center", padding: 6, fontWeight: 500, border: "1px solid #eee", color: "#222" }}>{slot}</td>
                  {days.map(d => {
                    // Hiển thị tất cả suất chiếu bắt đầu trong slot này
                    const shows = (showtimeByDay[d.format("YYYY-MM-DD")] || []).filter(
                      s => {
                        // So sánh giờ bắt đầu với slot
                        const hour = Number(s.showTime.slice(0, 2));
                        const slotHour = Number(slot.slice(0, 2));
                        return hour === slotHour;
                      }
                    );
                    return (
                      <td key={d.format("YYYY-MM-DD")} style={{ padding: 6, border: "1px solid #eee", verticalAlign: "top", color: "#222" }}>
                        {shows.length === 0 ? (
                          <span style={{ color: "#aaa" }}>Trống</span>
                        ) : (
                          shows.map(showtime => (
                            <div
                              key={showtime.id}
                              style={{
                                border: "1px solid #b3b3b3",
                                borderRadius: 6,
                                marginBottom: 6,
                                padding: 8,
                                color: "#222"
                              }}
                            >
                              <div style={{ fontWeight: 600, marginBottom: 4, color: "#222" }}>
                                {showtime.movieTitle}
                              </div>
                              <div style={{ fontSize: 12, color: "#222" }}>
                                <div>
                                  <b>Thời gian:</b>{" "}
                                  <span style={{ color: "#1677ff" }}>
                                    {showtime.showTime?.slice(0, 5)} - {showtime.toTime?.slice(0, 5)}
                                  </span>
                                </div>
                                <div><b>Phòng:</b> {showtime.cinemaRoom}</div>
                                <div><b>Rạp:</b> {showtime.cinemaName}</div>
                                <div><b>TP:</b> {showtime.cityName}</div>
                              </div>
                              <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                                <MultiSwitch
                                  checked={!!showtime.active}
                                  onChange={async () => {
                                    setLoading(true);
                                    try {
                                      const res = await onOffShowtime(showtime.id);
                                      if (!res.error) {
                                        toast.success("Cập nhật kích hoạt thành công!");
                                        fetchShowtimes();
                                      } else {
                                        toast.error(res.message);
                                      }
                                    } catch {
                                      toast.error("Cập nhật kích hoạt thất bại!");
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  loading={loading}
                                  checkedChildren="Bật"
                                  unCheckedChildren="Tắt"
                                />
                               
                                <Tooltip title="Xóa">
                                  <Button
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                    style={{
                                      background: "none",
                                      color: "#ff4d4f",
                                      borderColor: "#ff4d4f",
                                      borderRadius: 4,
                                      padding: 0,
                                      minWidth: 28,
                                      height: 28,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center"
                                    }}
                                    onClick={() => showDeleteConfirm(showtime)}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal xác nhận xóa thuần */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedShowtime(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa suất chiếu cho phim "<b>{selectedShowtime?.movieTitle}</b>"?
        </p>
        <p className="text-red-500 font-medium">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
};

export default ShowTimeManagement;