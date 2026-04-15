import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Card, Row, Col, Tag, Divider, Statistic, Space, Button } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  TrophyOutlined,
  GlobalOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { getMovieById } from "../../../service/movie/index";
import CommentManagement from "./CommentManagement";

const statusText = (status) => {
  if (status === "Now Showing") return "Đang chiếu";
  if (status === "Coming Soon") return "Sắp chiếu";
  return "Dừng chiếu";
};

// Hàm lấy videoId từ link youtube
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const MovieDetail = ({ visible, movie: propMovie, onCancel, onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sử dụng movie từ props nếu có, ngược lại fetch từ API
  const movieToUse = propMovie || movie;
  const movieId = propMovie ? propMovie.movieID : id;

  useEffect(() => {
    if (propMovie) {
      // Nếu có movie từ props, sử dụng luôn
      setMovie(propMovie);
      setLoading(false);
    } else if (id) {
      // Nếu không có props, fetch từ API
      const fetchMovie = async () => {
        setLoading(true);
        try {
          const response = await getMovieById(id);
          if (!response.error) {
            setMovie(response.result);
          }
        } catch (error) {
          setMovie(null);
        } finally {
          setLoading(false);
        }
      };
      fetchMovie();
    }
  }, [id, propMovie]);

  if (loading) {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={1400}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <PlayCircleOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Chi tiết phim</span>
          </div>
        }
        centered
      >
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin phim...</p>
          </div>
        </div>
      </Modal>
    );
  }

  if (!movieToUse) {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={1400}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <PlayCircleOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Chi tiết phim</span>
          </div>
        }
        centered
      >
        <div className="text-center py-12">
          <CloseCircleOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phim</h3>
          <p className="text-gray-500">Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>
      </Modal>
    );
  }

  const youtubeId = getYoutubeId(movieToUse.trailer);

  const content = (
    <div className="p-2">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        {!propMovie && (
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            size="small"
          >
            Quay lại
          </Button>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Poster & Stats */}
          <div className="lg:col-span-1 space-y-3">
            {/* Poster Card - Light Blue/Purple */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 p-3">
              <div className="text-center">
                <img
                  src={movieToUse.poster}
                  alt={movieToUse.title}
                  className="w-full max-w-[170px] h-[240px] object-cover rounded-xl shadow-xl mx-auto mb-3 border-4 border-white"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/170x240?text=No+Image";
                  }}
                />
                
                {/* Status Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  <Tag
                    color={
                      movieToUse.status === "Now Showing" ? "green" :
                      movieToUse.status === "Coming Soon" ? "orange" : "red"
                    }
                    icon={
                      movieToUse.status === "Now Showing" ? <CheckCircleOutlined /> :
                      movieToUse.status === "Coming Soon" ? <ClockCircleOutlined /> : <CloseCircleOutlined />
                    }
                    className="px-3 py-1 text-xs font-semibold shadow-md"
                  >
                    {statusText(movieToUse.status)}
                  </Tag>
                  
                  <Tag
                    color={movieToUse.active ? "green" : "red"}
                    icon={movieToUse.active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className="px-3 py-1 text-xs font-semibold shadow-md"
                  >
                    {movieToUse.active ? "Hoạt động" : "Dừng"}
                  </Tag>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl border border-blue-300 shadow-md">
                    <div className="font-bold text-blue-800 text-lg">{movieToUse.seller ?? 0}</div>
                    <div className="text-blue-600 font-medium">Vé đã bán</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl border border-blue-300 shadow-md">
                    <div className="font-bold text-blue-800 text-lg">{movieToUse.runningTime}</div>
                    <div className="text-blue-600 font-medium">Phút</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trailer Card - Light Green */}
            <Card 
              title={
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <VideoCameraOutlined className="text-green-600" />
                  <span>Trailer</span>
                </div>
              }
              className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50"
              size="small"
            >
              {youtubeId ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <VideoCameraOutlined className="text-3xl mb-2 text-green-400" />
                  <p className="text-sm">Chưa có trailer</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-3">
            {/* Movie Info Card - Light Purple */}
            <Card 
              title={
                <div className="flex items-center gap-2 font-semibold text-purple-700">
                  <FileTextOutlined className="text-purple-600" />
                  <span>Thông tin phim</span>
                </div>
              }
              className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50"
              size="small"
            >
              <div className="space-y-3">
                {/* Title & Basic Info */}
                <div>
                  <h1 className="text-lg font-bold text-gray-900 mb-2">{movieToUse.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {movieToUse.genre?.split(',').map((genre, index) => (
                      <Tag key={index} color="purple" className="px-3 py-1 text-xs font-semibold shadow-md">
                        {genre.trim()}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileTextOutlined className="text-purple-600" />
                    Nội dung
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 text-sm">
                    {movieToUse.content}
                  </p>
                </div>

                {/* Cast & Crew */}
                <Row gutter={12}>
                  <Col span={12}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <UserOutlined className="text-purple-600" />
                      Đạo diễn
                    </h3>
                    <p className="text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-sm">{movieToUse.director}</p>
                  </Col>
                  <Col span={12}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <TeamOutlined className="text-purple-600" />
                      Diễn viên
                    </h3>
                    <p className="text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-sm">{movieToUse.actors}</p>
                  </Col>
                </Row>

                {/* Technical Details */}
                <Row gutter={12}>
                  <Col span={8}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <GlobalOutlined className="text-purple-600" />
                      Ngôn ngữ
                    </h3>
                    <p className="text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-sm">{movieToUse.language}</p>
                  </Col>
                  <Col span={8}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <PlayCircleOutlined className="text-purple-600" />
                      Phiên bản
                    </h3>
                    <p className="text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-sm">{movieToUse.version}</p>
                  </Col>
                  <Col span={8}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <StarOutlined className="text-purple-600" />
                      Giới hạn tuổi
                    </h3>
                    <p className="text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-sm">{movieToUse.ageRating}</p>
                  </Col>
                </Row>

                {/* Production Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <TrophyOutlined className="text-purple-600" />
                    Hãng sản xuất
                  </h3>
                  <p className="text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-sm">{movieToUse.productionCompany}</p>
                </div>
              </div>
            </Card>

            {/* Schedule Info Card - Light Orange */}
            <Card 
              title={
                <div className="flex items-center gap-2 font-semibold text-orange-700">
                  <CalendarOutlined className="text-orange-600" />
                  <span>Lịch chiếu</span>
                </div>
              }
              className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50"
              size="small"
            >
              <Row gutter={12}>
                <Col span={12}>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl border border-orange-300 shadow-md">
                    <div className="text-xs text-orange-700 font-medium mb-1">Ngày khởi chiếu</div>
                    <div className="font-bold text-orange-800 text-sm">
                      {movieToUse.fromDate
                        ? new Date(movieToUse.fromDate).toLocaleDateString()
                        : "Chưa có lịch"}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl border border-orange-300 shadow-md">
                    <div className="text-xs text-orange-700 font-medium mb-1">Ngày dừng chiếu</div>
                    <div className="font-bold text-orange-800 text-sm">
                      {movieToUse.toDate
                        ? new Date(movieToUse.toDate).toLocaleDateString()
                        : "Chưa có lịch"}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </div>

        {/* Comments Section - Full Width - Light Blue */}
        <div className="mt-4">
          <Card 
            title={
              <div className="flex items-center gap-2 font-semibold text-blue-700">
                <EyeOutlined className="text-blue-600" />
                <span>Đánh giá & Bình luận</span>
              </div>
            }
            className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50"
            size="small"
          >
            <CommentManagement movieId={movieId} />
          </Card>
        </div>
      </div>
    </div>
  );

  // Nếu có props visible (modal mode), wrap trong Modal
  if (visible !== undefined) {
    return (
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={1000}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <PlayCircleOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Chi tiết phim</span>
          </div>
        }
        centered
        destroyOnClose
        className="movie-detail-modal"
        styles={{
          body: { padding: '12px' },
          content: { padding: '0' },
          header: { padding: '16px 24px 8px 24px' }
        }}
      >
        {content}
      </Modal>
    );
  }

  // Nếu không có props visible (page mode), render trực tiếp
  return content;
};

export default MovieDetail;