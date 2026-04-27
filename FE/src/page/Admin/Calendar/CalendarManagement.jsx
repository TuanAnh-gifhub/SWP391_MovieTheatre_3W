import React, { useRef, useEffect, useState } from "react";
import { Button, Radio, Modal } from "antd";
import { LeftOutlined, RightOutlined, PlusOutlined, DeleteOutlined, EditOutlined, VideoCameraAddOutlined } from "@ant-design/icons";
import { getAllCalendars, deleteCalendar } from "../../../service/calendar";
import AddCalendar from "./AddCalendar";
import EditCalendar from "./EditCalendar";
import SetMovieDate from "./SetMovieDate";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DAYS_IN_WEEK = 7;
function getDays(centerDate, mode) {
  if (mode === "week") {
    const monthStart = dayjs(centerDate).startOf("month");
    const monthEnd = dayjs(centerDate).endOf("month");
    const gridStart = monthStart.startOf("week");
    const gridEnd = monthEnd.endOf("week");
    const days = [];
    let current = gridStart;
    while (current.isSameOrBefore(gridEnd, "day")) {
      days.push(current.clone()); 
      current = current.add(1, "day");
    }
    return days;
  } else {
    const monthStart = dayjs(centerDate).startOf("month");
    const monthEnd = dayjs(centerDate).endOf("month");
    const gridStart = monthStart.startOf("week");
    const gridEnd = monthEnd.endOf("week");
    const days = [];
    let current = gridStart;
    while (current.isSameOrBefore(gridEnd, "day")) {
      days.push(current.clone()); 
      current = current.add(1, "day");
    }
    return days;
  }
}

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

function getTwoWeeks(centerDate) {
  const start = dayjs(centerDate).startOf("week");
  const days = [];
  for (let i = 0; i < 14; i++) {
    days.push(start.add(i, "day"));
  }
  return days;
}

const statusColor = (status) => {
  if (status === "Now Showing") {
    return {
      border: "border-green-400",
      bg: "bg-green-50",
      text: "text-green-700",
    };
  }
  if (status === "Coming Soon") {
    return {
      border: "border-yellow-400",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
    };
  }
  return {
    border: "border-red-400",
    bg: "bg-red-50",
    text: "text-red-700",
  };
};

const statusLabel = (status) => {
  if (status === "Now Showing") return "Đang chiếu";
  if (status === "Coming Soon") return "Sắp chiếu";
  return "Đã kết thúc";
};

const weekdayLabels = ["CN", "TH 2", "TH 3", "TH 4", "TH 5", "TH 6", "TH 7"];
const weekdayLabels14 = Array(14)
  .fill(0)
  .map((_, i) => weekdayLabels[i % 7]);

const CalendarManagement = ({ addModalVisible, setAddModalVisible }) => {
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  // Use props if provided, otherwise use local state
  const modalVisible = addModalVisible !== undefined ? addModalVisible : showAdd;
  const setModalVisible = setAddModalVisible !== undefined ? setAddModalVisible : setShowAdd;
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [setMovieModalVisible, setSetMovieModalVisible] = useState(false);
  const [editCalendar, setEditCalendar] = useState(null);
  const [selectedSetCalendar, setSelectedSetCalendar] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [viewMode, setViewMode] = useState("week");
  const [centerDate, setCenterDate] = useState(dayjs());
  const gridRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);

  useEffect(() => {
    fetchCalendars();
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
  }, [viewMode, centerDate]);

  const days =
    viewMode === "week"
      ? getTwoWeeks(centerDate)
      : getDays(centerDate, "month"); 

  const gridCols = days.length; 

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const res = await getAllCalendars();
      if (res.data && res.data.status === 200) {
        setCalendars(res.data.result || []);
      }
    } catch (err) {
      toast.error("Không thể tải lịch chiếu!");
    }
    setLoading(false);
  };

  const movieBlocks = [];
  const occupied = Array(days.length)
    .fill(0)
    .map(() => []); 

  const startDay = days[0].startOf("day");
  const endDay = days[days.length - 1].startOf("day");
  const visibleCalendars = calendars.filter((calendar) => {
    const from = dayjs(calendar.fromDate).startOf("day");
    const to = dayjs(calendar.toDate).startOf("day");
    return to.isSameOrAfter(startDay) && from.isSameOrBefore(endDay);
  });

  // Sắp xếp để phim dài ngày lên trước và ưu tiên thời gian bắt đầu
  visibleCalendars.sort((a, b) => {
    const aFrom = dayjs(a.fromDate);
    const aTo = dayjs(a.toDate);
    const bFrom = dayjs(b.fromDate);
    const bTo = dayjs(b.toDate);
    
    // Ưu tiên theo thời gian bắt đầu
    if (aFrom.isBefore(bFrom)) return -1;
    if (aFrom.isAfter(bFrom)) return 1;
    
    // Nếu cùng thời gian bắt đầu, ưu tiên phim dài hơn
    const aDuration = aTo.diff(aFrom, "day");
    const bDuration = bTo.diff(bFrom, "day");
    return bDuration - aDuration;
  });

  // Logic mới hoàn toàn để tránh chèn lên nhau - Sửa lại
  visibleCalendars.forEach((calendar) => {
    const from = dayjs(calendar.fromDate).startOf("day");
    const to = dayjs(calendar.toDate).startOf("day");
    const gridStart = days[0];
    const gridEnd = days[days.length - 1];
    const realFrom = from.isBefore(gridStart) ? gridStart : from;
    const realTo = to.isAfter(gridEnd) ? gridEnd : to;
    const startIdx = days.findIndex(d => d.isSame(realFrom, "day"));
    const endIdx = days.findIndex(d => d.isSame(realTo, "day"));
    
    // Tìm row phù hợp để không bị chèn lên nhau
    let row = 0;
    let hasConflict = true;
    
    while (hasConflict) {
      hasConflict = false;
      // Kiểm tra xem có conflict với các block khác không
      for (let i = startIdx; i <= endIdx; i++) {
        if (occupied[i] && occupied[i][row]) {
          hasConflict = true;
          break;
        }
      }
      if (hasConflict) {
        row++;
      }
    }
    
    // Đánh dấu vị trí đã chiếm
    for (let i = startIdx; i <= endIdx; i++) {
      if (!occupied[i]) {
        occupied[i] = [];
      }
      occupied[i][row] = true;
    }
    
    movieBlocks.push({
      calendar,
      row,
      startIdx,
      endIdx,
    });
  });

  // Sắp xếp lại movieBlocks theo row để đảm bảo thứ tự hiển thị
  movieBlocks.sort((a, b) => a.row - b.row);

  // Tìm số row tối đa để set chiều cao grid
  const maxRow = movieBlocks.reduce((max, b) => Math.max(max, b.row), 0);

  // Tính nhãn cho từng ngày (thứ/ngày)
  const getDayLabel = (d) =>
    viewMode === "week"
      ? (
          <>
            <span className="text-xs font-semibold">{d.format("ddd")}</span>
            <span className="text-lg font-bold">{d.format("DD/MM")}</span>
          </>
        )
      : (
          <span className="text-sm font-semibold">{d.format("DD/MM")}</span>
        );

  // Xử lý chọn phim 
  const handleSelectMovie = (calendar) => {
    setSelectedSetCalendar(calendar);
    setSetMovieModalVisible(true);
  };

  // Xử lý sửa lịch 
  const handleEditCalendar = (calendar) => {
    setEditCalendar(calendar);
    setEditModalVisible(true);
  };

  // Xử lý xóa lịch 
  const handleDeleteCalendar = (calendar) => {
    setSelectedCalendar(calendar);
    setDeleteModalVisible(true);
  };

  // Hàm xác nhận xóa lịch
  const confirmDeleteCalendar = async () => {
    if (!selectedCalendar) return;
    try {
      await deleteCalendar(selectedCalendar.id);
      toast.success("Xóa lịch chiếu thành công!");
      setDeleteModalVisible(false);
      setSelectedCalendar(null);
      fetchCalendars();
    } catch {
      toast.error("Xóa lịch chiếu thất bại!");
      setDeleteModalVisible(false);
      setSelectedCalendar(null);
    }
  };

  const weekDays = getWeekDays(centerDate);

  return (
    <div className="">
      <div className="shadow-md rounded-lg bg-white dark:bg-white overflow-x-auto">
        <div className="p-6 min-w-[1200px]">
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold text-center flex-1 text-black dark:text-black">
              Tháng {centerDate.format("M, YYYY")}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="week">Tuần</Radio.Button>
              <Radio.Button value="month">Tháng</Radio.Button>
            </Radio.Group>
            <div className="flex gap-2">
              <Button
                icon={<LeftOutlined />}
                onClick={() =>
                  setCenterDate(
                    viewMode === "week"
                      ? centerDate.subtract(DAYS_IN_WEEK, "day")
                      : centerDate.subtract(1, "month")
                  )
                }
                className="rounded-full bg-white shadow border border-gray-200"
              />
              <Button
                icon={<RightOutlined />}
                onClick={() =>
                  setCenterDate(
                    viewMode === "week"
                      ? centerDate.add(DAYS_IN_WEEK, "day")
                      : centerDate.add(1, "month")
                  )
                }
                className="rounded-full bg-white shadow border border-gray-200"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-white rounded-lg">
            <div
              className="relative overflow-x-auto"
              style={{
                maxWidth: "100%",
                whiteSpace: "nowrap",
              }}
            >
              <div
                className="grid gap-1 mb-6"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(24px, 1fr))`, 
                  maxWidth: "100%",
                }}
              >
                {days.map((d, idx) => (
                  <div
                    key={d.format("YYYY-MM-DD")}
                    className={`flex flex-col items-center px-0.5 py-1 rounded-lg min-h-[24px] transition-all duration-200
                      ${d.isSame(dayjs(), "day") ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 dark:bg-white border border-gray-200"}
                    `}
                    style={{ minWidth: 24, fontSize: 12 }}
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase  dark:text-black">
                      {weekdayLabels[d.day()]}
                    </span>
                    <span className="text-xs font-bold text-black dark:text-black">
                      {d.date()}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="grid gap-1"
                ref={gridRef}
                                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(24px, 1fr))`,
                    minHeight: Math.max(420, (maxRow + 1) * 150),
                    position: "relative",
                    zIndex: 1,
                    maxWidth: "100%",
                  }}
              >
                {days.map((d) => (
                  <div
                    key={d.format("YYYY-MM-DD")}
                    className="bg-white border border-gray-200 rounded-lg flex flex-col relative"
                    style={{ minHeight: 140 }}
                  >
                  </div>
                ))}
              </div>

              {movieBlocks.map((block, idx) => {
                const color = statusColor(block.calendar.status);
                const cellWidth = gridWidth / gridCols;
                const left = block.startIdx * cellWidth;
                const width = (block.endIdx - block.startIdx + 1) * cellWidth;
                
                return (
                  <div
                    key={block.calendar.id + "-" + block.row}
                    className={`absolute ${color.bg} ${color.border} ${color.text} rounded-md shadow-sm px-1 py-1 cursor-pointer hover:shadow-md transition-shadow duration-200`}
                    style={{
                      left,
                      width,
                      top: 70 + (block.row * 120), // Sử dụng top trực tiếp với khoảng cách lớn
                      minHeight: 70, // Tăng chiều cao tối thiểu
                      borderWidth: 2,
                      borderStyle: "solid",
                      zIndex: 10 + block.row,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      pointerEvents: "auto",
                      fontSize: 11,
                      position: "absolute",
                    }}
                    onClick={() => handleSelectMovie(block.calendar)}
                  >
                    <div className="flex flex-wrap gap-1 pr-12">
                      {block.calendar.movies && block.calendar.movies.length > 0
                        ? block.calendar.movies
                            .filter(movie => movie.active === true || movie.active === undefined)
                            .map((movie, i) => {
                              const colors = [
                                "bg-blue-100 text-blue-700",
                                "bg-pink-100 text-pink-600",
                                "bg-green-100 text-green-700",
                                "bg-orange-100 text-orange-600",
                                "bg-purple-100 text-purple-700",
                                "bg-amber-100 text-amber-700",
                                "bg-cyan-100 text-cyan-700",
                                "bg-lime-100 text-lime-700",
                                "bg-fuchsia-100 text-fuchsia-700",
                                "bg-red-100 text-red-700",
                              ];
                              return (
                                <span
                                  key={movie.id || i}
                                  className={`px-2 py-1 rounded-md font-bold text-xs ${colors[i % colors.length]}`}
                                  title={movie.title}
                                >
                                  {movie.title.length > 15 ? movie.title.substring(0, 15) + '...' : movie.title}
                                </span>
                              );
                            })
                        : <span className="text-gray-500 text-xs">Chưa có phim</span>}
                    </div>
                    <div className="text-xs mt-1">
                      <span>
                        <b>Từ:</b> {dayjs(block.calendar.fromDate).format("DD/MM/YYYY")}
                      </span>
                      <br />
                      <span>
                        <b>Đến:</b> {dayjs(block.calendar.toDate).format("DD/MM/YYYY")}
                      </span>
                      <br />
                      <span>
                        <b>Trạng thái:</b>{" "}
                        <span className={`font-semibold ${color.text}`}>
                          {statusLabel(block.calendar.status)}
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        zIndex: 20,
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCalendar(block.calendar);
                        }}
                        title="Sửa lịch"
                        style={{ padding: 2, minWidth: 24, height: 24 }}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCalendar(block.calendar);
                        }}
                        title="Xóa lịch"
                        style={{ padding: 2, minWidth: 24, height: 24 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* xác nhận xóa */}
          <Modal
            title="Xác nhận xóa"
            open={deleteModalVisible}
            onOk={confirmDeleteCalendar}
            onCancel={() => {
              setDeleteModalVisible(false);
              setSelectedCalendar(null);
            }}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <p>
              Bạn có chắc chắn muốn xóa lịch chiếu
              {selectedCalendar ? ` từ ngày "${selectedCalendar.fromDate}" đến "${selectedCalendar.toDate}"` : ""}?
              <br />Hành động này không thể hoàn tác.
            </p>
          </Modal>

          {/* thêm/sửa/chọn phim */}
          <AddCalendar
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSuccess={fetchCalendars}
          />
          <EditCalendar
            visible={editModalVisible}
            calendar={editCalendar}
            onClose={() => setEditModalVisible(false)}
            onSuccess={() => {
              setEditModalVisible(false);
              fetchCalendars();
            }}
          />
          <SetMovieDate
            visible={setMovieModalVisible}
            calendar={selectedSetCalendar}
            onClose={() => setSetMovieModalVisible(false)}
            onSuccess={() => {
              setSetMovieModalVisible(false);
              fetchCalendars();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;