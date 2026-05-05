import React, { useEffect, useState } from "react";
import { EditOutlined, HomeOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Modal, Button, Form, Select, DatePicker, TimePicker, message, Row, Col, Input } from "antd";
import { updateShowtime, fetchAllRooms } from "../../../service/showtime";
import dayjs from "dayjs";

const { Option } = Select;

const EditShowTime = ({
  showtime,
  onSuccess,
  visible: controlledVisible,
  onCancel,
  hideTrigger = false,
  buttonProps = {},
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [allRooms, setAllRooms] = useState([]);
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaRooms, setCinemaRooms] = useState([]);

  const isControlled = typeof controlledVisible === "boolean";
  const visible = isControlled ? controlledVisible : internalVisible;

  const closeModal = () => {
    if (!isControlled) {
      setInternalVisible(false);
    }
    onCancel?.();
  };

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

  useEffect(() => {
    if (!visible || !showtime || allRooms.length === 0) return;

    const movieIdToUse = showtime.movieId ? Number(showtime.movieId) : undefined;
    let cityID, cinemaID, cinemaRoomID = showtime.cinemaRoomId;
    let cityObj, cinemaObj;
    allRooms.forEach(city => {
      city.cinemas.forEach(cinema => {
        cinema.cinemaRooms.forEach(room => {
          if (room.cinemaRoomID === cinemaRoomID) {
            cityID = city.cityID;
            cinemaID = cinema.cinemaID;
            cityObj = city;
            cinemaObj = cinema;
          }
        });
      });
    });
    setCinemas(cityObj ? cityObj.cinemas : []);
    setCinemaRooms(cinemaObj ? cinemaObj.cinemaRooms : []);
    form.setFieldsValue({
      showtimeId: showtime.showtimeId || showtime.id,
      movieId: movieIdToUse || "", // luôn set vào form, tránh undefined
      cityID: cityID,
      cinemaID: cinemaID,
      cinemaRoomId: cinemaRoomID,
      date: showtime.date ? dayjs(showtime.date) : null,
      time: showtime.time ? dayjs(showtime.time?.slice(0, 5), "HH:mm") : null,
      version: showtime.version,
    });
  }, [visible, showtime, allRooms, form]);

  const openModal = () => {
    if (!isControlled) {
      setInternalVisible(true);
    }
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
        closeModal();
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
      {!hideTrigger && (
        <Button
          icon={<EditOutlined />}
          onClick={openModal}
          type="primary"
          size="small"
          style={{ marginRight: 8 }}
          {...buttonProps}
        />
      )}
      <Modal
        title={
          <span className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <VideoCameraOutlined /> Chỉnh sửa suất chiếu
          </span>
        }
        open={visible}
        onOk={handleOk}
        onCancel={closeModal}
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