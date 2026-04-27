import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Modal,
  DatePicker,
  Upload,
  Select,
  Row,
  Col,
  Divider,
} from "antd";
import { UploadOutlined, VideoCameraOutlined, PictureOutlined } from "@ant-design/icons";
import { addMovie } from "../../../service/movie/index";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import AddMovieTMDB from "./AddMovieTMDB";

const { TextArea } = Input;

const genreOptions = [
  { value: "Hành động", label: "Phim Hành Động (Action)" },
  { value: "Kinh dị", label: "Phim Kinh Dị (Horror)" },
  { value: "Tình cảm", label: "Phim Tình Cảm (Romance)" },
  { value: "Hài", label: "Phim Hài (Comedy)" },
  { value: "Khoa học viễn tưởng", label: "Phim Khoa Học Viễn Tưởng (Science Fiction)" },
  { value: "Hành trình", label: "Phim Hành Trình (Adventure)" },
  { value: "Cổ trang", label: "Phim Cổ Trang (Historical)" },
  { value: "Tâm lý", label: "Phim Tâm Lý (Psychological Thriller)" },
  { value: "Hoạt hình", label: "Phim Hoạt Hình (Animation)" },
  { value: "Khoa học", label: "Phim Khoa Học (Documentary)" },
  { value: "Viễn tưởng", label: "Phim Viễn Tưởng (Fantasy)" },
  { value: "Tội phạm", label: "Phim Tội Phạm (Crime)" },
  { value: "Lãng mạn - hài", label: "Phim Lãng Mạn - Tình Cảm (Romantic Comedy)" },
  { value: "Gia đình", label: "Phim Gia Đình (Family)" },
  { value: "Chính kịch", label: "Phim Chính Kịch (Drama)" },
  { value: "Chiến tranh", label: "Phim Chiến Tranh (War)" },
  { value: "Hồi ký", label: "Phim Hồi Ký (Biography)" },
  { value: "Nhạc kịch", label: "Phim Musicals" },
  { value: "Thể loại khác", label: "Thể loại khác" },
];

const languageOptions = [
  { value: "Tiếng việt", label: "Tiếng Việt" },
  { value: "Tiếng anh", label: "Tiếng Anh" },
  { value: "Tiếng trung", label: "Tiếng Trung" },
  { value: "Tiếng nhật", label: "Tiếng Nhật" },
  { value: "Tiếng hàn", label: "Tiếng Hàn" },
  { value: "Tiếng pháp", label: "Tiếng Pháp" },
  { value: "Tiếng Đức", label: "Tiếng Đức" },
  { value: "Tiếng Nga", label: "Tiếng Nga" },
  { value: "Ngôn ngữ khác", label: "Ngôn ngữ khác" },
];

const versionOptions = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
  { value: "4DX", label: "4DX" },
];

const ageRatingOptions = [
  { value: "P", label: "P - Mọi lứa tuổi" },
  { value: "K", label: "K - Dưới 13 tuổi có người bảo hộ đi cùng" },
  { value: "T13", label: "C13 - Trên 13 tuổi" },
  { value: "T16", label: "C16 - Trên 16 tuổi" },
  { value: "T18", label: "C18 - Trên 18 tuổi" },
  { value: "C", label: "C - Phim không được phép phổ biến" },
];

const AddMovie = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showTMDB, setShowTMDB] = useState(false);

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const onPosterChange = (info) => {
    const file = info.file?.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPosterPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      // Nếu không có file, lấy giá trị từ trường posterUrl nếu có
      const url = form.getFieldValue("posterUrl");
      setPosterPreview(url || null);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Lấy file poster hoặc url
      let posterUrl = "";
      const file = values.poster?.[0]?.originFileObj;
      if (file) {
        posterUrl = await uploadToCloudinary(file);
      } else if (values.posterUrl) {
        posterUrl = values.posterUrl;
      } else {
        toast.error("Vui lòng chọn poster phim hoặc nhập URL poster");
        setLoading(false);
        return;
      }

      // Format ngày
      const releaseDate = values.releaseDate
        ? dayjs(values.releaseDate).format("YYYY-MM-DD")
        : "";

      // Tạo object movie
      const movieData = {
        title: values.title,
        actors: values.actors,
        director: values.director,
        productionCompany: values.productionCompany,
        runningTime: values.runningTime,
        version: values.version,
        trailer: values.trailer,
        content: values.content,
        genre: Array.isArray(values.genre) ? values.genre.join(", ") : values.genre,
        language: Array.isArray(values.language) ? values.language.join(", ") : values.language,
        ageRating: values.ageRating,
        releaseDate,
        poster: posterUrl,
      };

      // Tạo phim
      const response = await addMovie(movieData);

      if (!response.error) {
        toast.success(response.message || "Thêm phim thành công!");
        form.resetFields();
        setPosterPreview(null);
        onSuccess && onSuccess();
        onCancel && onCancel();
      } else {
        toast.error(response.message || "Thêm phim thất bại");
      }
    } catch (error) {
      toast.error("Thêm phim thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Hàm uploadToCloudinary
  const uploadToCloudinary = async (file) => {
    const CLOUDINARY_UPLOAD_PRESET = "phuocnt-cloudinary";
    const CLOUDINARY_CLOUD_NAME = "dl5dphe0f";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url;
  };

  const handleSelectTMDB = (movie) => {
    form.setFieldsValue({
      title: movie.title,
      content: movie.content,
      posterUrl: movie.poster,
      actors: movie.actors,
      director: movie.director,
      productionCompany: movie.productionCompany,
      runningTime: movie.runningTime,
      version: movie.version,
      trailer: movie.trailer,
      genre: movie.genre ? movie.genre.split(",").map(s => s.trim()) : [],
      language: movie.language ? movie.language.split(",").map(s => s.trim()) : [],
      ageRating: movie.ageRating,
      releaseDate: movie.releaseDate ? dayjs(movie.releaseDate) : undefined,
    });
    setPosterPreview(movie.poster || null);
    setTrailerUrl(movie.trailer || "");
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={1100}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <VideoCameraOutlined className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Thêm phim mới</span>
          </div>
        }
        destroyOnHidden
        style={{ top: 30 }}
        className="!rounded-xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="mt-2"
        >
          <Row gutter={32}>
            {/* Bên trái: Poster & Trailer */}
            <Col xs={24} md={10}>
              <div className="bg-gradient-to-br from-blue-900 to-indigo-700 rounded-xl p-6 shadow-lg flex flex-col items-center min-h-[480px] border border-blue-200">
                <div className="w-full flex flex-col items-center mb-6">
                  <Form.Item
                    name="poster"
                    label={<span className="text-white font-semibold text-lg">🎬 Poster phim (tải từ máy)</span>}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    style={{ marginBottom: 0, width: "100%" }}
                  >
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      accept="image/*"
                      listType="picture"
                      onChange={onPosterChange}
                    >
                      <Button 
                        icon={<UploadOutlined />}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        📁 Chọn ảnh
                      </Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    name="posterUrl"
                    label={<span className="text-white font-semibold text-lg">🔗 Hoặc nhập URL poster</span>}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    <Input
                      prefix={<PictureOutlined className="text-blue-400" />}
                      placeholder="Dán URL poster tại đây nếu không tải ảnh"
                      onChange={e => setPosterPreview(e.target.value || null)}
                      onBlur={e => setPosterPreview(e.target.value || null)}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </Form.Item>
                  {posterPreview && (
                    <div className="w-full flex justify-center mt-2">
                      <img
                        src={posterPreview}
                        alt="Poster Preview"
                        style={{
                          maxWidth: 220,
                          maxHeight: 320,
                          borderRadius: 12,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                          background: "#fff",
                          objectFit: "cover",
                          border: "3px solid white"
                        }}
                        onError={e => (e.target.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
                <Divider className="bg-blue-300" />
                <div className="w-full">
                  <Form.Item
                    name="trailer"
                    label={<span className="text-white font-semibold text-lg">🎥 Trailer (URL)</span>}
                    rules={[{ required: true, message: "Vui lòng nhập link trailer" }]}
                    style={{ marginBottom: 8 }}
                  >
                    <Input
                      prefix={<VideoCameraOutlined className="text-blue-400" />}
                      placeholder="Nhập link trailer"
                      onChange={e => setTrailerUrl(e.target.value)}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </Form.Item>
                  <div className="w-full h-72 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center mt-2 border border-blue-300 shadow-lg">
                    {getYoutubeEmbedUrl(trailerUrl) ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(trailerUrl)}
                        title="YouTube trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: 8, width: "100%", height: "100%" }}
                      />
                    ) : (
                      <div className="text-center">
                        <VideoCameraOutlined className="text-4xl text-blue-400 mb-2" />
                        <span className="text-white text-sm opacity-80">🎬 Xem trước trailer</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
            {/* Bên phải: Thông tin phim */}
            <Col xs={24} md={14}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <Form.Item
                  name="title"
                  label={<span className="font-semibold text-gray-900 text-lg">🎭 Tên phim</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên phim" }]}
                >
                  <Input 
                    placeholder="Nhập tên phim" 
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </Form.Item>
                <Form.Item
                  name="content"
                  label={<span className="font-semibold text-gray-900 text-lg">📝 Nội dung</span>}
                  rules={[{ required: true, message: "Vui lòng nhập nội dung phim" }]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Nhập nội dung phim" 
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </Form.Item>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name="productionCompany"
                      label={<span className="font-semibold text-gray-900">🏢 Hãng sản xuất</span>}
                      rules={[{ required: true, message: "Vui lòng nhập hãng sản xuất" }]}
                    >
                      <Input 
                        placeholder="Nhập hãng sản xuất" 
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="director"
                      label={<span className="font-semibold text-gray-900">🎬 Đạo diễn</span>}
                      rules={[{ required: true, message: "Vui lòng nhập đạo diễn" }]}
                    >
                      <Input 
                        placeholder="Nhập tên đạo diễn" 
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="actors"
                  label={<span className="font-semibold text-gray-900">👥 Diễn viên</span>}
                  rules={[{ required: true, message: "Vui lòng nhập diễn viên" }]}
                >
                  <Input 
                    placeholder="Nhập tên diễn viên, cách nhau bởi dấu phẩy" 
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </Form.Item>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name="genre"
                      label={<span className="font-semibold text-gray-900">🎭 Thể loại</span>}
                      rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn thể loại"
                        options={genreOptions}
                        allowClear
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="language"
                      label={<span className="font-semibold text-gray-900">🌍 Ngôn ngữ</span>}
                      rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn ngôn ngữ"
                        options={languageOptions}
                        allowClear
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name="version"
                      label={<span className="font-semibold text-gray-900">🎬 Phiên bản</span>}
                      rules={[{ required: true, message: "Vui lòng chọn phiên bản" }]}
                    >
                      <Select
                        placeholder="Chọn phiên bản"
                        options={versionOptions}
                        allowClear
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="ageRating"
                      label={<span className="font-semibold text-gray-900">👶 Giới hạn tuổi</span>}
                      rules={[{ required: true, message: "Vui lòng chọn giới hạn tuổi" }]}
                    >
                      <Select
                        placeholder="Chọn giới hạn tuổi"
                        options={ageRatingOptions}
                        allowClear
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name="runningTime"
                      label={<span className="font-semibold text-gray-900">⏰ Thời lượng phim</span>}
                      rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        placeholder="VD: 120 phút"
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="releaseDate"
                      label={<span className="font-semibold text-gray-900">📅 Ngày ra mắt</span>}
                      rules={[{ required: true, message: "Vui lòng chọn ngày ra mắt" }]}
                    >
                      <DatePicker 
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" 
                        format="YYYY-MM-DD" 
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Divider className="my-4" />
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={onCancel} 
              disabled={loading} 
              className="border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
            >
              Hủy
            </Button>
            <Button
              type="default"
              onClick={() => setShowTMDB(true)}
              style={{ marginRight: 8 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🎬 Gợi ý từ TMDB
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg"
            >
              Thêm phim
            </Button>
          </div>
        </Form>
      </Modal>
      <AddMovieTMDB
        visible={showTMDB}
        onCancel={() => setShowTMDB(false)}
        onSelect={handleSelectTMDB}
      />
    </>
  );
};

export default AddMovie;