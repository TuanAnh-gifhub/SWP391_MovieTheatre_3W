import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tooltip, Modal, Switch, Input, Select } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, InboxOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import {
  getAllMovies,
  deleteMovie,
  updateMovie,
  onOffMovie, 
} from "../../../service/movie/index";
import { toast } from "react-toastify";
import AddMovie from "./AddMovie";
import EditMovie from "./EditMovie";
import ShowTimeCreate from "../ShowTime/ShowTimeCreate";
import MovieDetail from "./MovieDetail";
import MultiSwitch from "./Switch";

const MovieManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editMovieId, setEditMovieId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [genreFilter, setGenreFilter] = useState(""); 
  const [statusFilter, setStatusFilter] = useState(""); // Thêm state cho filter trạng thái
  const [allGenres, setAllGenres] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [statusBadgeFilter, setStatusBadgeFilter] = useState(null); // null: tất cả, 'Now Showing', 'Coming Soon', 'Ended', 'NoSchedule'
  const [theme, setTheme] = useState(document.body.getAttribute('data-theme') || 'light');
  const [multiSwitchLoading, setMultiSwitchLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState(null);

  // Tạo danh sách thể loại động từ dữ liệu thực tế
  useEffect(() => {
    if (allMovies.length > 0) {
      // Lấy tất cả thể loại từ danh sách phim
      const allGenres = Array.from(
        new Set(
          allMovies
            .map((m) => m.genre)
            .flatMap((g) => (typeof g === "string" ? g.split(",") : g))
            .map((g) => g && g.trim())
            .filter(Boolean)
        )
      );
      setAllGenres(allGenres);
      
      // Tạo danh sách thể loại động cho filter
      const dynamicGenreOptions = [
        { value: "", label: "Tất cả thể loại" },
        ...allGenres.map(genre => ({
          value: genre,
          label: `Phim ${genre}`
        }))
      ];
      setGenreOptions(dynamicGenreOptions);
    }
  }, [allMovies]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const fetchMovies = async ({
    page = 1,
    pageSize = 8,
    search = searchText,
    genre = genreFilter,
    status = statusBadgeFilter,
  } = {}) => {
    setLoading(true);
    const response = await getAllMovies();
    if (!response.error && Array.isArray(response.result)) {
      let allMoviesRaw = response.result;
      setAllMovies(allMoviesRaw); // Lưu lại danh sách phim gốc
      let allMovies = allMoviesRaw;

      // Lọc theo tên phim
      if (search) {
        allMovies = allMovies.filter((movie) =>
          movie.title?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Lọc theo thể loại
      if (genre) {
        const genreValues = genreMap[genre] || [genre];
        allMovies = allMovies.filter((movie) => {
          const genres = (typeof movie.genre === "string"
            ? movie.genre.split(",")
            : movie.genre
          )
            .map((g) => g && g.trim().toLowerCase())
            .filter(Boolean);

          return genreValues.some((val) =>
            genres.includes(val.trim().toLowerCase())
          );
        });
      }

      // Lọc theo trạng thái từ badge
      if (status) {
        allMovies = allMovies.filter((movie) => {
          if (status === "Ended") {
            // Lọc các trạng thái kết thúc
            return (
              movie.status === "Ended" ||
              movie.status === "Đã kết thúc"
            );
          }
          if (status === "Now Showing") {
            return (
              movie.status === "Now Showing" ||
              movie.status === "Đang chiếu"
            );
          }
          if (status === "Coming Soon") {
            return (
              movie.status === "Coming Soon" ||
              movie.status === "Sắp chiếu"
            );
          }
          if (status === "NoSchedule") {
            // Lọc các phim chưa có lịch chiếu
            return !movie.fromDate && !movie.toDate;
          }
          return false;
        });
      }

      const sortedMovies = allMovies.slice().sort((a, b) => {
        const order = {
          "Đã kết thúc": 0,
          "Now Showing": 1,
          "Đang chiếu": 1,
          "Coming Soon": 2,
          "Sắp chiếu": 2,
          "Ended": 0,
        };
        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
      });
      setPagination({
        current: page,
        pageSize: pageSize,
        total: sortedMovies.length,
      });
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      setMovies(sortedMovies.slice(startIdx, endIdx));
    } else {
      setMovies([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      toast.error(response.message || "Không lấy được danh sách phim");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchMovies({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const toggleStatus = async (movie) => {
    try {
      setLoading(true);
      const newStatus = movie.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await updateMovieStatus(movie.id, newStatus);
      if (!response.error) {
        fetchMovies({
          page: pagination.current,
          pageSize: pagination.pageSize,
        });
        toast.success(response.message || "Cập nhật trạng thái phim thành công!");
      } else {
        toast.error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (movie) => {
    setMovieToDelete(movie);
    setDeleteModalVisible(true);
  };

  const showModal = () => {
    setShowAddModal(true);
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
  };

  const handleAddSuccess = (msg) => {
    toast.success(msg);
    setShowAddModal(false);
    fetchMovies();
  };

  const handleEdit = (movie) => {
    setEditMovieId(movie.movieID);
    setEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditMovieId(null);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditMovieId(null);
    fetchMovies({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // Hàm cập nhật trạng thái Kích hoạt cho nhiều phim
  const handleMultiSwitch = async () => {
    setMultiSwitchLoading(true);
    try {
      const moviesToUpdate =
        selectedRowKeys.length === 0
          ? movies
          : movies.filter((m) => selectedRowKeys.includes(m.movieID));
      const ids = moviesToUpdate.map((m) => m.movieID);
      const response = await onOffMovie(ids); // chỉ truyền mảng ID
      if (!response.error) {
        toast.success(response.message || `Đã đảo trạng thái kích hoạt ${
          moviesToUpdate.length === movies.length ? "tất cả phim" : "các phim đã chọn"
        } thành công!`);
        setSelectedRowKeys([]);
        fetchMovies({
          page: pagination.current,
          pageSize: pagination.pageSize,
        });
      } else {
        toast.error(response.message || "Có lỗi khi cập nhật trạng thái!");
      }
    } catch {
      toast.error("Có lỗi khi cập nhật trạng thái!");
    } finally {
      setMultiSwitchLoading(false);
    }
  };

  // Lấy trạng thái chung: nếu tất cả phim (hoặc phim được chọn) đều active thì bật, ngược lại tắt
  const getMultiSwitchChecked = () => {
    const list =
      selectedRowKeys.length === 0
        ? movies
        : movies.filter((m) => selectedRowKeys.includes(m.movieID));
    if (list.length === 0) return false;
    return list.every((m) => m.active);
  };

  // Đảm bảo danh sách thể loại filter giống AddMovie.jsx
  const genreMap = {
    "Hành động": ["Hành động", "Action"],
    "Kinh dị": ["Kinh dị", "Horror"],
    "Tình cảm": ["Tình cảm", "Romance"],
    "Hài": ["Hài", "Comedy"],
    "Khoa học viễn tưởng": ["Khoa học viễn tưởng", "Science Fiction"],
    "Hành trình": ["Hành trình", "Adventure"],
    "Cổ trang": ["Cổ trang", "Historical"],
    "Tâm lý": ["Tâm lý", "Psychological Thriller"],
    "Hoạt hình": ["Hoạt hình", "Animation"],
    "Khoa học": ["Khoa học", "Documentary"],
    "Viễn tưởng": ["Viễn tưởng", "Fantasy"],
    "Tội phạm": ["Tội phạm", "Crime"],
    "Lãng mạn - hài": ["Lãng mạn - hài", "Romantic Comedy"],
    "Gia đình": ["Gia đình", "Family"],
    "Chính kịch": ["Chính kịch", "Drama"],
    "Chiến tranh": ["Chiến tranh", "War"],
    "Hồi ký": ["Hồi ký", "Biography"],
    "Nhạc kịch": ["Nhạc kịch", "Musicals"],
    "Thể loại khác": ["Thể loại khác"],
  };

  const [genreOptions, setGenreOptions] = useState([
    { value: "", label: "Tất cả thể loại" }
  ]);

  // Khi search/filter thay đổi thì fetch lại
  useEffect(() => {
    fetchMovies({
      page: 1,
      pageSize: pagination.pageSize,
      search: searchText,
      genre: genreFilter,
      status: statusBadgeFilter,
    });
    // eslint-disable-next-line
  }, [searchText, genreFilter, statusBadgeFilter]);

  // Thống kê số lượng phim theo trạng thái (dựa trên allMovies gốc)
  const totalMovies = allMovies.length;
  const nowShowing = allMovies.filter(m => 
    m.status === "Now Showing" || m.status === "Đang chiếu"
  ).length;
  const comingSoon = allMovies.filter(m => 
    m.status === "Coming Soon" || m.status === "Sắp chiếu"
  ).length;
  const ended = allMovies.filter(m => 
    m.status === "Ended" || m.status === "Đã kết thúc"
  ).length;
  const noSchedule = allMovies.filter(m => !m.fromDate && !m.toDate).length;

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <PlayCircleOutlined className="text-xl text-white" />
        </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý phim</h1>
              <p className="text-sm text-gray-600">Quản lý thông tin và lịch chiếu phim</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              icon={<PlusOutlined />}
            onClick={showModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 h-10 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Thêm phim mới
            </Button>
        </div>
      </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div 
          className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusBadgeFilter === null 
              ? 'border-blue-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-blue-300 hover:z-10'
          }`}
          onClick={() => setStatusBadgeFilter(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng số phim</p>
              <p className="text-lg font-bold text-blue-900">{totalMovies}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <PlayCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusBadgeFilter === 'Now Showing' 
              ? 'border-green-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-green-300 hover:z-10'
          }`}
          onClick={() => setStatusBadgeFilter(statusBadgeFilter === 'Now Showing' ? null : 'Now Showing')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đang chiếu</p>
              <p className="text-lg font-bold text-green-700">{nowShowing}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusBadgeFilter === 'Coming Soon' 
              ? 'border-orange-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-orange-300 hover:z-10'
          }`}
          onClick={() => setStatusBadgeFilter(statusBadgeFilter === 'Coming Soon' ? null : 'Coming Soon')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Sắp chiếu</p>
              <p className="text-lg font-bold text-orange-700">{comingSoon}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <ClockCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusBadgeFilter === 'Ended' 
              ? 'border-red-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-red-300 hover:z-10'
          }`}
          onClick={() => setStatusBadgeFilter(statusBadgeFilter === 'Ended' ? null : 'Ended')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Đã kết thúc</p>
              <p className="text-lg font-bold text-red-700">{ended}</p>
      </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <CloseCircleOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
        <div 
          className={`bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative ${
            statusBadgeFilter === 'NoSchedule' 
              ? 'border-gray-500 shadow-lg scale-[1.02] z-10' 
              : 'border-gray-200 hover:border-gray-300 hover:z-10'
          }`}
          onClick={() => setStatusBadgeFilter(statusBadgeFilter === 'NoSchedule' ? null : 'NoSchedule')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Chưa có lịch</p>
              <p className="text-lg font-bold text-gray-700">{noSchedule}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md">
              <InboxOutlined className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <MultiSwitch
            checked={getMultiSwitchChecked()}
            onChange={handleMultiSwitch}
            loading={multiSwitchLoading}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
          <span className="text-sm text-gray-600">
            {selectedRowKeys.length === 0
              ? "Bật/Tắt kích hoạt tất cả phim"
              : `Bật/Tắt ${selectedRowKeys.length} phim đã chọn`}
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={movies.length > 0 && movies.every(m => selectedRowKeys.includes(m.movieID))}
              ref={el => {
                if (el) {
                  el.indeterminate = movies.length > 0 && selectedRowKeys.length > 0 && selectedRowKeys.length < movies.length;
                }
              }}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedRowKeys(movies.map(m => m.movieID));
                } else {
                  setSelectedRowKeys([]);
                }
              }}
              disabled={loading || movies.length === 0}
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </label>
          </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              placeholder="Tìm kiếm phim..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-10 w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                paddingLeft: '40px',
                color: 'black',
                backgroundColor: 'white',
              }}
            />
        </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Thể loại:</span>
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
              style={{
                color: 'black',
                backgroundColor: 'white',
              }}
            >
              {genreOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ color: 'black', backgroundColor: 'white' }}>
                  {option.label}
                </option>
              ))}
            </select>
      </div>
        </div>
      </div>

      {/* Movie Cards */}
      {movies.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phim nào</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm phim mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {movies.map((movie) => {
          const isSelected = selectedRowKeys.includes(movie.movieID);
            
          // Trạng thái badge
            let statusColor = "bg-gray-200 text-gray-500 border-gray-300";
          let statusText = "Chưa có lịch";
            
            // Kiểm tra trước tiên xem có lịch chiếu không
            if (!movie.fromDate && !movie.toDate) {
              statusColor = "bg-gray-200 text-gray-600 border-gray-400";
              statusText = "Chưa có lịch";
            } else if (movie.status === "Now Showing" || movie.status === "Đang chiếu") {
              statusColor = "bg-green-200 text-green-800 border-green-300 shadow-sm";
            statusText = "Đang chiếu";
          } else if (movie.status === "Coming Soon" || movie.status === "Sắp chiếu") {
              statusColor = "bg-orange-200 text-orange-800 border-orange-300 shadow-sm";
            statusText = "Sắp chiếu";
          } else if (movie.status === "Ended" || movie.status === "Đã kết thúc") {
              statusColor = "bg-red-200 text-red-800 border-red-300 shadow-sm";
            statusText = "Đã kết thúc";
            } else {
              // Nếu có lịch nhưng không có status rõ ràng
              statusColor = "bg-blue-200 text-blue-800 border-blue-300 shadow-sm";
              statusText = "Có lịch";
          }

          return (
            <div
              key={movie.movieID}
                className={`bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden ${
                  isSelected ? 'border-blue-500 shadow-lg scale-[1.02] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 z-10' : 'border-gray-200 hover:border-blue-300 hover:z-10'
                }`}
              onClick={() => {
                if (!loading) {
                  setSelectedRowKeys(prev =>
                    prev.includes(movie.movieID)
                      ? prev.filter(id => id !== movie.movieID)
                      : [...prev, movie.movieID]
                  );
                }
              }}
            >
                {/* Checkbox and Status */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={e => {
                  e.stopPropagation();
                  setSelectedRowKeys(prev =>
                    prev.includes(movie.movieID)
                      ? prev.filter(id => id !== movie.movieID)
                      : [...prev, movie.movieID]
                  );
                }}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-auto z-10 relative"
                disabled={loading}
              />
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusText}
                  </div>
                </div>

                {/* Movie Info */}
                <div className="p-4 bg-gradient-to-br from-white to-blue-50">
              {/* Poster */}
                  <div className="flex justify-center mb-3">
                <img
                  src={movie.poster}
                  alt={movie.title}
                      className="w-20 h-28 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                      onError={e => {
                        e.target.src = "https://via.placeholder.com/80x112?text=No+Image";
                      }}
                    />
                  </div>

                  {/* Title */}
                  <div className="text-center mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">{movie.title}</h3>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Thể loại:</span>
                      <span className="text-gray-900 font-medium truncate max-w-[120px]">{movie.genre}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Đã bán:</span>
                      <span className="text-blue-700 font-bold">{movie.seller ?? 0} vé</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Từ:</span>
                      <span className="text-gray-900 font-medium">
                        {movie.fromDate ? new Date(movie.fromDate).toLocaleDateString() : "-"}
                  </span>
              </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Đến:</span>
                      <span className="text-gray-900 font-medium">
                        {movie.toDate ? new Date(movie.toDate).toLocaleDateString() : "-"}
                      </span>
              </div>
              </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Tooltip title="Xem chi tiết">
                      <Button
                        size="small"
                        icon={<EyeOutlined className="text-blue-600" />}
                        onClick={e => { 
                          e.stopPropagation(); 
                          setSelectedMovieForDetail(movie);
                          setDetailModalVisible(true);
                        }}
                        className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                      />
                    </Tooltip>
                <Tooltip title="Chỉnh sửa">
                  <Button
                        size="small"
                        icon={<EditOutlined className="text-green-600" />}
                    onClick={e => { e.stopPropagation(); handleEdit(movie); }}
                        className="flex-1 border-green-300 text-green-700 hover:border-green-400 hover:text-green-800 shadow-sm bg-gradient-to-r from-green-100 to-emerald-100"
                  />
                </Tooltip>
                <Tooltip title="Tạo suất chiếu">
                  <Button
                        size="small"
                        icon={<PlusOutlined className="text-purple-600" />}
                    onClick={e => { e.stopPropagation(); setSelectedMovieId(movie.movieID); setShowCreate(true); }}
                        className="flex-1 border-purple-300 text-purple-700 hover:border-purple-400 hover:text-purple-800 shadow-sm bg-gradient-to-r from-purple-100 to-violet-100"
                  />
                </Tooltip>
                <Tooltip title="Xóa">
                  <Button
                        size="small"
                        icon={<DeleteOutlined className="text-red-600" />}
                    onClick={e => { e.stopPropagation(); showDeleteConfirm(movie); }}
                        className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                  />
                </Tooltip>
              </div>

                  {/* Status Toggle */}
                  <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Trạng thái:</span>
                      <MultiSwitch
                        checked={movie.active}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        loading={loading}
                        onChange={async () => {
                          setLoading(true);
                          try {
                            const response = await onOffMovie(movie.movieID);
                            if (!response.error) {
                              toast.success(response.message || "Cập nhật kích hoạt thành công!");
                              fetchMovies({
                                page: pagination.current,
                                pageSize: pagination.pageSize,
                              });
                            } else {
                              toast.error(response.message || "Cập nhật kích hoạt thất bại!");
                            }
                          } catch (err) {
                            toast.error("Cập nhật kích hoạt thất bại!");
                          } finally {
                            setLoading(false);
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
              : theme === 'dark' ? 'bg-gray-700 text-white hover:bg-blue-700 hover:text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === 1}
          onClick={() => {
            if (pagination.current > 1) {
              setPagination(prev => ({ ...prev, current: prev.current - 1 }));
              fetchMovies({ page: pagination.current - 1, pageSize: pagination.pageSize });
            }
          }}
        >
          &lt;
        </button>
        {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
              ${pagination.current === page
                ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white scale-105'
                : theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-blue-700 hover:text-white'
                  : 'bg-white text-blue-700 hover:bg-blue-100'}
            `}
            onClick={() => {
              setPagination(prev => ({ ...prev, current: page }));
              fetchMovies({ page, pageSize: pagination.pageSize });
            }}
          >
            {page}
          </button>
        ))}
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center
            ${pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : theme === 'dark' ? 'bg-gray-700 text-white hover:bg-blue-700 hover:text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}
          `}
          disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize) || pagination.total === 0}
          onClick={() => {
            if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
              setPagination(prev => ({ ...prev, current: prev.current + 1 }));
              fetchMovies({ page: pagination.current + 1, pageSize: pagination.pageSize });
            }
          }}
        >
          &gt;
        </button>
        <select
          className={`ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition
            ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-blue-700 border-blue-200'}`}
          value={pagination.pageSize}
          onChange={e => {
            setPagination(prev => ({ ...prev, current: 1, pageSize: Number(e.target.value) }));
            fetchMovies({ page: 1, pageSize: Number(e.target.value) });
          }}
        >
          {[8, 16, 32].map(size => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      {/* Modals */}
      <AddMovie
        visible={showAddModal}
        onCancel={handleAddCancel}
        onSuccess={handleAddSuccess}
      />
      <EditMovie
        visible={editModalVisible}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
        movieID={editMovieId}
      />
      
      {/* ShowTime Create Modal */}
      <ShowTimeCreate
        visible={showCreate}
        movieId={selectedMovieId}
        onCancel={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false);
          setSelectedMovieId(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={async () => {
          try {
            setLoading(true);
            const response = await deleteMovie(movieToDelete.movieID);

            if (!response.error) {
              await fetchMovies({
                page: pagination.current,
                pageSize: pagination.pageSize,
              });
              toast.success(response.message || "Xóa phim thành công!");
            } else {
              toast.error(response.message || "Xóa phim thất bại");
            }
          } catch (error) {
            toast.error("Xóa phim thất bại");
          } finally {
            setLoading(false);
            setDeleteModalVisible(false);
            setMovieToDelete(null);
          }
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setMovieToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa phim "{movieToDelete?.title}"?
        </p>
        <p className="text-red-500 font-medium">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>

      {/* Movie Detail Modal */}
      <MovieDetail
        visible={detailModalVisible}
        movie={selectedMovieForDetail}
        onCancel={() => setDetailModalVisible(false)}
        onSuccess={() => {
          setDetailModalVisible(false);
          setSelectedMovieForDetail(null);
        }}
      />

    </>
  );
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 font-medium">{value || "-"}</span>
    </div>
  );
}

export default MovieManagement;

