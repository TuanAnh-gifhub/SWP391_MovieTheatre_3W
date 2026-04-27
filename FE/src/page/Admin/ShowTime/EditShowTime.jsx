import React, { useEffect, useState } from "react";
import { EditOutlined, HomeOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Modal, Button, Form, Select, DatePicker, TimePicker, message, Row, Col, Input } from "antd";
import { updateShowtime, fetchAllRooms } from "../../../service/showtime";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

const { Option } = Select;

const EditShowTime = ({ showtime, onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [allRooms, setAllRooms] = useState([]);
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaRooms, setCinemaRooms] = useState([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const movieIdFromUrl = params.get("movieId");
  // Ưu tiên lấy movieId từ showtime, nếu không có thì lấy từ URL
  let movieIdToUse = showtime.movieId;
  if (!movieIdToUse || movieIdToUse === 0) {
    movieIdToUse = movieIdFromUrl ? Number(movieIdFromUrl) : undefined;
  }

  useEffect(() => {
    const loadRooms = async () => {
      const res = await fetchAllRooms();
      if (!res.error) {
        setAllRooms(res.result);
        setCities(res.result.map(city => ({ id: city.cityID, name: city.name, cinemas: city.cinemas })));
      }
    };
    loadRooms();
  }, []);

  const openModal = () => {
    setVisible(true);
    // Tìm city, cinema, room theo showtime.cinemaRoomId
    let cityID, cinemaID, cinemaRoomID = showtime.cinemaRoomId;
    let cityObj, cinemaObj, roomObj;
    allRooms.forEach(city => {
      city.cinemas.forEach(cinema => {
        cinema.cinemaRooms.forEach(room => {
          if (room.cinemaRoomID === cinemaRoomID) {
            cityID = city.cityID;
            cinemaID = cinema.cinemaID;
            cityObj = city;
            cinemaObj = cinema;
            roomObj = room;
          }
        });
      });
    });
    setCinemas(cityObj ? cityObj.cinemas : []);
    setCinemaRooms(cinemaObj ? cinemaObj.cinemaRooms : []);
    form.setFieldsValue({
      showtimeId: showtime.showtimeId,
      movieId: movieIdToUse || "", // luôn set vào form, tránh undefined
      cityID: cityID,
      cinemaID: cinemaID,
      cinemaRoomId: cinemaRoomID,
      date: showtime.date ? dayjs(showtime.date) : null,
      time: showtime.time ? dayjs(showtime.time, "HH:mm") : null,
      version: showtime.version,
    });
  };

  const handleCityChange = (cityID) => {
    const city = allRooms.find(c => c.cityID === cityID);
    setCinemas(city ? city.cinemas : []);
    setCinemaRooms([]);
    form.setFieldsValue({ cinemaID: undefined, cinemaRoomId: undefined });
  };

  const handleCinemaChange = (cinemaID) => {
    const cinema = cinemas.find(c => c.cinemaID === cinemaID);
    setCinemaRooms(cinema ? cinema.cinemaRooms : []);
    form.setFieldsValue({ cinemaRoomId: undefined });
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = {
        showtimeId: values.showtimeId,
        movieId: values.movieId, // lấy trực tiếp từ form
        cinemaRoomId: values.cinemaRoomId,
        date: values.date ? values.date.format("YYYY-MM-DD") : "",
        time: values.time ? values.time.format("HH:mm") : "",
        version: values.version,
      };
      const res = await updateShowtime(payload);
      if (!res.error) {
        message.success("Cập nhật suất chiếu thành công!");
        setVisible(false);
        onSuccess && onSuccess();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      // validation error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        icon={<EditOutlined />}
        onClick={openModal}
        type="primary"
        size="small"
        style={{ marginRight: 8 }}
      />
      <Modal
        title={
          <span className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <VideoCameraOutlined /> Chỉnh sửa suất chiếu
          </span>
        }
        open={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        confirmLoading={loading}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        styles={{ body: { padding: 24 } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="showtimeId" label="ID suất chiếu" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="movieId" label={<span><VideoCameraOutlined /> ID phim</span>} rules={[{ required: true, message: "Bắt buộc" }]}>
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="version" label={<span><HomeOutlined /> Phiên bản</span>} rules={[{ required: true, message: "Bắt buộc" }]}>
                <Select placeholder="Chọn phiên bản">
                  <Option value="2D">2D</Option>
                  <Option value="3D">3D</Option>
                  <Option value="IMAX">IMAX</Option>
                  <Option value="4DX">4DX</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cityID"
                label="Thành phố"
                rules={[{ required: true, message: "Vui lòng chọn thành phố" }]}
              >
                <Select placeholder="Chọn thành phố" onChange={handleCityChange}>
                  {cities.map(city => (
                    <Option key={city.id} value={city.id}>{city.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cinemaID"
                label="Rạp"
                rules={[{ required: true, message: "Vui lòng chọn rạp" }]}
              >
                <Select placeholder="Chọn rạp" onChange={handleCinemaChange} disabled={!cinemas.length}>
                  {cinemas.map(cinema => (
                    <Option key={cinema.cinemaID} value={cinema.cinemaID}>{cinema.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cinemaRoomId"
                label="Phòng chiếu"
                rules={[{ required: true, message: "Vui lòng chọn phòng chiếu" }]}
              >
                <Select placeholder="Chọn phòng chiếu" disabled={!cinemaRooms.length}>
                  {cinemaRooms.map(room => (
                    <Option key={room.cinemaRoomID} value={room.cinemaRoomID}>{room.roomName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Ngày chiếu" rules={[{ required: true, message: "Bắt buộc" }]}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="time" label="Giờ chiếu" rules={[{ required: true, message: "Bắt buộc" }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditShowTime;