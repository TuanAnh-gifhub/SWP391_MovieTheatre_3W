import React, { useState } from "react";
import { Modal, Input, Button, List, Avatar, Spin } from "antd";
import { SearchOutlined, DatabaseOutlined, SelectOutlined } from "@ant-design/icons";
import { searchMovieTMDB, getMovieTMDBDetail } from "../../../service/movie";
import { toast } from "react-toastify";

const AddMovieTMDB = ({ visible, onCancel, onSelect }) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!search.trim()) {
      toast.warning("Vui lòng nhập tên phim để tìm kiếm!");
      return;
    }
    setLoading(true);
    const res = await searchMovieTMDB(search);
    if (res.status === 200 && Array.isArray(res.result)) {
      setResults(res.result);
    } else {
      setResults([]);
      toast.error(res.message || "Không tìm thấy phim phù hợp!");
    }
    setLoading(false);
  };

  // Thay đổi hàm chọn phim để lấy chi tiết
  const handleSelect = async (item) => {
    setLoading(true);
    const res = await getMovieTMDBDetail(item.movieId);
    setLoading(false);
    if (res.status === 200 && res.result) {
      onSelect(res.result);
      onCancel();
    } else {
      toast.error(res.message || "Không lấy được chi tiết phim!");
    }
  };

  const handleCancel = () => {
    setSearch("");
    setResults([]);
    onCancel();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <DatabaseOutlined className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Tìm kiếm phim từ TMDB</span>
        </div>
      }
      destroyOnHidden
      className="!rounded-xl"
    >
      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <Input
            placeholder="Nhập tên phim để tìm kiếm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="pl-10 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            style={{
              color: 'black',
              backgroundColor: 'white',
            }}
          />
          <Button
            type="primary"
            onClick={handleSearch}
            loading={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 h-8 px-4 rounded-lg shadow-md"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang tìm kiếm phim...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <DatabaseOutlined className="text-6xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết quả tìm kiếm</h3>
            <p className="text-gray-500">Nhập tên phim và nhấn tìm kiếm để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 p-4 hover:shadow-lg hover:scale-[1.02] group"
              >
                <div className="flex items-start gap-4">
                  {/* Poster */}
                  <div className="flex-shrink-0">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-16 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                        onError={e => {
                          e.target.src = "https://via.placeholder.com/64x96?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-200 shadow-md">
                        <span className="text-2xl font-bold text-gray-500">{item.title?.[0] || "?"}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {item.title}
                        </h3>
                        {item.content && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                            {item.content}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {item.releaseDate && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              {new Date(item.releaseDate).getFullYear()}
                            </span>
                          )}
                          {item.voteAverage && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              ⭐ {item.voteAverage}/10
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Select Button */}
                      <Button
                        type="primary"
                        icon={<SelectOutlined />}
                        onClick={() => handleSelect(item)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all"
                      >
                        Chọn
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {results.length > 0 && `Tìm thấy ${results.length} kết quả`}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCancel} className="border-gray-300 text-gray-700 hover:border-gray-400">
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMovieTMDB;