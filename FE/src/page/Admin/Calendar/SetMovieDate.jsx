import React, { useState, useEffect } from "react";
import { Modal, Select, Spin, Button, Tooltip, Input } from "antd";
import { setMovieToCalendar, getAllMovies } from "../../../service/calendar";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { PlayCircleOutlined, CalendarOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const SetMovieDate = ({ visible, calendar, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [movieOptions, setMovieOptions] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getAllMovies()
        .then(res => {
          if (res.data && res.data.status === 200) {
            setMovieOptions(
              res.data.result.map(m => ({
                label: m.title,
                value: m.movieID,
                poster: m.poster,
                duration: m.runningTime,
                version: m.version,
                director: m.director,
                releaseDate: m.releaseDate,
                status: m.status,
                active: m.active !== undefined ? m.active : m.status === "Active",
                searchLabel: m.title,
              }))
            );
          }
        })
        .finally(() => setLoading(false));
      setSelectedMovies(calendar?.movies?.map(m => m.movieID) || []);
    }
  }, [visible, calendar]);

  // Không cho chọn phim inactive (nếu đã chọn trước đó thì loại bỏ)
  useEffect(() => {
    if (movieOptions.length > 0 && selectedMovies.length > 0) {
      const activeMovieIds = movieOptions.filter(m => m.active).map(m => m.value);
      const filtered = selectedMovies.filter(id => activeMovieIds.includes(id));
      if (filtered.length !== selectedMovies.length) {
        setSelectedMovies(filtered);
      }
    }
  }, [movieOptions]);

  const handleOk = async () => {
    setLoading(true);
    try {
      await setMovieToCalendar(calendar.id, selectedMovies);
      showSuccessToast("Gán phim vào lịch thành công!");
      onSuccess && onSuccess();
    } catch (err) {
      showErrorToast("Gán phim vào lịch thất bại!");
      if (err.response) {
        console.log("API error:", err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter movies based on search and status
  const filteredMovies = movieOptions.filter(movie => {
    const matchesSearch = movie.label.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === null || movie.active === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalMovies = movieOptions.length;
  const activeMovies = movieOptions.filter(m => m.active).length;
  const inactiveMovies = movieOptions.filter(m => !m.active).length;
  const selectedCount = selectedMovies.length;

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <PlayCircleOutlined className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chọn phim cho lịch chiếu</h1>
              <p className="text-sm text-gray-600">Gán phim vào lịch chiếu từ {dayjs(calendar?.fromDate).format("DD/MM/YYYY")} đến {dayjs(calendar?.toDate).format("DD/MM/YYYY")}</p>
            </div>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1000}
        className="!rounded-xl"
      >
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                  <p className="text-xs font-medium text-gray-600">Tổng phim</p>
                  <p className="text-lg font-bold text-blue-900">{totalMovies}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <PlayCircleOutlined className="text-white text-sm" />
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
                  <p className="text-lg font-bold text-green-700">{activeMovies}</p>
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
                  <p className="text-lg font-bold text-red-700">{inactiveMovies}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                  <CloseCircleOutlined className="text-white text-sm" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border-2 border-purple-200">
              <div className="flex items-center justify-between">
          <div>
                  <p className="text-xs font-medium text-gray-600">Đã chọn</p>
                  <p className="text-lg font-bold text-purple-700">{selectedCount}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                  <CalendarOutlined className="text-white text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center justify-end gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <Input
                placeholder="Tìm kiếm phim..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="pl-10 w-64 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                style={{ color: 'black', backgroundColor: 'white' }}
              />
            </div>
          </div>

          {/* Movie Selection */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-80 overflow-y-auto">
               {filteredMovies.map((movie) => {
                 const isSelected = selectedMovies.includes(movie.value);
                  return (
                    <div
                     key={movie.value}
                     className={`bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden cursor-pointer ${
                       isSelected 
                         ? 'border-blue-500 shadow-lg scale-[1.02] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 z-10' 
                         : 'border-gray-200 hover:border-blue-300 hover:z-10'
                     } ${!movie.active ? 'opacity-60' : ''}`}
                     onClick={() => {
                       if (!movie.active) return;
                       if (isSelected) {
                         setSelectedMovies(prev => prev.filter(id => id !== movie.value));
                       } else {
                         setSelectedMovies(prev => [...prev, movie.value]);
                       }
                     }}
                   >
                     {/* Header */}
                     <div className="p-2 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                       <div className="flex items-center gap-1">
                         <PlayCircleOutlined className="text-blue-600 text-xs" />
                         <span className="font-bold text-blue-700 text-xs truncate">{movie.label}</span>
                       </div>
                                                <div className={`px-1 py-0.5 rounded-full text-xs font-medium ${
                           movie.active 
                             ? 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 border border-green-300 shadow-sm' 
                             : 'bg-gradient-to-r from-red-200 to-rose-200 text-red-800 border border-red-300 shadow-sm'
                         }`}>
                           {movie.active ? 'Hoạt động' : 'Ngừng'}
                         </div>
                     </div>

                     {/* Content */}
                     <div className="p-2 bg-gradient-to-br from-white to-blue-50">
                       {/* Poster */}
                       <div className="flex justify-center mb-2">
                         <img
                           src={movie.poster}
                           alt={movie.label}
                           className="w-16 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                           onError={e => {
                             e.target.src = "https://via.placeholder.com/64x80?text=Movie";
                           }}
                         />
                       </div>

                       {/* Movie Info */}
                       <div className="space-y-1 mb-2">
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Thời lượng:</span>
                           <span className="text-blue-700 font-bold text-xs">{movie.duration} phút</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Phiên bản:</span>
                           <span className="text-gray-700 text-xs">{movie.version}</span>
                        </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Đạo diễn:</span>
                           <span className="text-gray-700 text-xs truncate">{movie.director}</span>
                        </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Phát hành:</span>
                           <span className="text-gray-700 text-xs">{movie.releaseDate}</span>
                        </div>
                      </div>

                       {/* Selection Status */}
                       <div className="pt-1 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded p-1">
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-600">Chọn:</span>
                           <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                             isSelected 
                               ? 'bg-blue-500 border-blue-500' 
                               : 'bg-white border-gray-300'
                           }`}>
                      {isSelected && (
                               <CheckCircleOutlined className="text-white text-xs" />
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                    </div>
                  );
               })}
             </div>
          )}

          {/* Selected Movies Summary */}
          {selectedMovies.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-green-700">Phim đã chọn ({selectedCount})</h3>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => setSelectedMovies([])}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa tất cả
                </Button>
              </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {selectedMovies.map(id => {
                const movie = movieOptions.find(m => m.value === id);
                if (!movie) return null;
                return (
                  <div
                    key={id}
                       className="flex items-center bg-white border border-green-200 rounded-lg shadow p-2 gap-2"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.label}
                         className="w-10 h-12 object-cover rounded border border-green-100"
                         onError={e => {
                           e.target.src = "https://via.placeholder.com/40x48?text=Movie";
                         }}
                    />
                    <div className="flex-1 min-w-0">
                         <div className="font-bold text-xs text-green-700 truncate">{movie.label}</div>
                         <div className="text-xs text-gray-600">
                        <span>⏱ {movie.duration} phút</span>
                           <span className="ml-2">🎬 {movie.version}</span>
                      </div>
                    </div>
                       <Button
                         type="text"
                         size="small"
                         icon={<DeleteOutlined />}
                         onClick={() => setSelectedMovies(prev => prev.filter(mid => mid !== id))}
                         className="text-red-500 hover:text-red-700 p-0 h-6 w-6"
                       />
                  </div>
                );
              })}
               </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="px-6 py-2 h-10 rounded-lg font-semibold transition-all bg-white border border-gray-300 shadow hover:bg-red-50 hover:border-red-400 hover:text-red-600"
            >
              Hủy
            </Button>
            <Button
              onClick={handleOk}
              type="primary"
              loading={loading}
              className="px-6 py-2 h-10 rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg hover:shadow-xl"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SetMovieDate;