import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Select, TimePicker, Modal, Row, Col, Divider, Tooltip, Checkbox } from 'antd';
import { createShowtime, fetchAllRooms } from '../../../service/showtime';
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import {
  CalendarOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Option } = Select;

const buildDateOptions = (days = 30) => {
  const today = dayjs();
  return Array.from({ length: days }, (_, index) => today.add(index, 'day').format('YYYY-MM-DD'));
};

const ShowTimeCreate = ({ visible, onCancel, onSuccess, movieId }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const movieIdFromUrl = params.get("movieId");
  const movieIdToUse = movieId || movieIdFromUrl;

  const [allRooms, setAllRooms] = useState([]);
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const formRef = useRef();

  useEffect(() => {
    setAvailableDates(buildDateOptions());
    if (movieIdToUse) form.setFieldsValue({ movieId: Number(movieIdToUse) });
  }, [movieIdToUse, form, visible]);

   useEffect(() => {
     const loadRooms = async () => {
       try {
         console.log("Starting loadRooms...");
         const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
         console.log("Admin user from localStorage:", adminUser);
         
         if (!adminUser.token) {
           console.error("No token found in localStorage");
           toast.error("No authentication token. Please login again.");
           return;
         }

         const res = await fetchAllRooms();
         console.log("fetchAllRooms response:", res);
         
         if (!res.error && res.result) {
           console.log("✓ Successfully fetched rooms, count:", res.result.length);
           setAllRooms(res.result);
           const mappedCities = res.result.map(city => ({ 
             cityID: city.cityID, 
             name: city.name, 
             cinemas: city.cinemas 
           }));
           console.log("Mapped cities:", mappedCities);
           setCities(mappedCities);
           if (mappedCities.length === 0) {
             console.warn("⚠ No cities found in response");
             toast.warning("No cities available. Please check backend data.");
           }
         } else {
           console.error("✗ Error from API:", res);
           const errorMsg = res.message || "Failed to fetch cities and rooms";
           console.error("Error message:", errorMsg);
           toast.error(errorMsg);
         }
       } catch (error) {
         console.error("✗ Exception in loadRooms:", error);
         toast.error("Failed to load cities and rooms: " + error.message);
       }
     };
     if (visible) {
       console.log("Modal visible = true, loading rooms...");
       loadRooms();
     }
   }, [visible]);

  const handleCityChange = (cityID) => {
    const city = allRooms.find(c => c.cityID === cityID);
    setCinemas(city ? city.cinemas : []);
    setCinemaRooms([]);
    form.setFieldsValue({ cinemaID: undefined, cinemaRoomID: undefined });
  };

  const handleCinemaChange = (cinemaID) => {
    const cinema = cinemas.find(c => c.cinemaID === cinemaID);
    setCinemaRooms(cinema ? cinema.cinemaRooms : []);
    form.setFieldsValue({ cinemaRoomID: undefined });
  };

  // Khi chọn lại ngày, reset giờ chiếu cho ngày không còn chọn
  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    const times = form.getFieldValue('times') || {};
    Object.keys(times).forEach(date => {
      if (!dates.includes(date)) {
        times[date] = [];
      }
    });
    form.setFieldsValue({ times });
  };

  // Submit tạo suất chiếu
  const onFinish = async (values) => {
    if (!movieIdToUse) {
      toast.error('Thiếu thông tin phim để tạo suất chiếu');
      return;
    }
    setLoading(true);
    const times = values.times || {};
    // Lấy các ngày có giờ chiếu
    const validDates = Object.keys(times).filter(date => (times[date] || []).length > 0);
    // Gom tất cả giờ chiếu của các ngày thành 1 mảng (không lặp lại)
    const allTimes = Array.from(
      new Set(
        validDates.flatMap(date => (times[date] || []).map(time => dayjs(time).format('HH:mm')))
      )
    );

    const showtimeData = {
      movieId: Number(movieIdToUse),
      dates: validDates,
      times: allTimes,
      cinemaRoomId: [values.cinemaRoomID],
      version: values.version,
    };

    const response = await createShowtime(showtimeData);
    if (!response.error) {
      toast.success('Thêm suất chiếu thành công!');
      form.resetFields();
      onSuccess && onSuccess();
      onCancel && onCancel();
    } else {
      toast.error(response.message || 'Thêm suất chiếu thất bại!');
    }
    setLoading(false);
  };

   // Reset form khi mở lại modal
   useEffect(() => {
     if (visible) {
       form.resetFields();
       // Preserve cities data, only reset cinema-related fields
       setCinemaRooms([]);
       setSelectedDates([]);
     }
   }, [visible, form, cities]);

  useEffect(() => {
    if (visible && movieIdToUse) {
      form.setFieldsValue({ movieId: Number(movieIdToUse) });
    }
  }, [visible, movieIdToUse, form]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={650}
      title={
        <span className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <VideoCameraOutlined /> Tạo suất chiếu mới
        </span>
      }
      destroyOnHidden
      styles={{ body: { padding: 24 } }}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" ref={formRef}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="version"
              label={<span><HomeOutlined /> Phiên bản</span>}
              rules={[{ required: true, message: 'Vui lòng chọn phiên bản' }]}
            >
              <Select placeholder="Chọn phiên bản">
                <Option value="2D">2D</Option>
                <Option value="3D">3D</Option>
                <Option value="IMAX">IMAX</Option>
                <Option value="4DX">4DX</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ fontWeight: 600, color: "#1677ff" }}>
          <EnvironmentOutlined /> Thông tin rạp chiếu
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="cityID"
              label={<span><EnvironmentOutlined /> Thành phố {cities.length === 0 && <span style={{color: 'red'}}>({cities.length} available)</span>}</span>}
              rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
            >
               <Select 
                 placeholder={cities.length === 0 ? "Không có thành phố nào (đang tải...)" : "Chọn thành phố"} 
                 onChange={handleCityChange}
                 disabled={cities.length === 0}
               >
                  {cities && cities.length > 0 ? (
                    cities.map(city => (
                      <Option key={city.cityID} value={city.cityID}>{city.name}</Option>
                    ))
                  ) : (
                    <Option disabled>Đang tải dữ liệu thành phố...</Option>
                  )}
                </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="cinemaID"
              label={<span><HomeOutlined /> Rạp</span>}
              rules={[{ required: true, message: 'Vui lòng chọn rạp' }]}
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
              name="cinemaRoomID"
              label={<span><HomeOutlined /> Phòng chiếu</span>}
              rules={[{ required: true, message: 'Vui lòng chọn phòng chiếu' }]}
            >
              <Select placeholder="Chọn phòng chiếu" disabled={!cinemaRooms.length}>
                {cinemaRooms.map(room => (
                  <Option key={room.cinemaRoomID} value={room.cinemaRoomID}>{room.roomName}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ fontWeight: 600, color: "#1677ff" }}>
          <CalendarOutlined /> Lịch chiếu
        </Divider>
        <Form.Item
          label={<span><CalendarOutlined /> Ngày chiếu</span>}
          required
          extra="Chọn nhiều ngày chiếu."
        >
          <Checkbox.Group
            options={availableDates.map(date => ({ label: date, value: date }))}
            value={selectedDates}
            onChange={handleDateChange}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          />
        </Form.Item>
        {selectedDates.map(date => (
          <Form.Item
            key={date}
            label={
              <span>
                <ClockCircleOutlined /> Giờ chiếu cho ngày <b>{date}</b>
              </span>
            }
            required
            style={{ marginBottom: 0 }}
            extra="Bạn có thể thêm nhiều giờ chiếu cho ngày này."
          >
            <Form.List name={['times', date]}>
              {(fields, { add, remove }) => (
                <Row gutter={8} align="middle">
                  {fields.map((field) => {
                    return (
                      <Col key={field.key}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Form.Item
                            key={field.key}
                            {...field}
                            rules={[{ required: true, message: 'Vui lòng chọn giờ chiếu' }]}
                            noStyle
                          >
                            <TimePicker format="HH:mm" />
                          </Form.Item>
                          <Tooltip title="Xóa giờ này">
                            <Button
                              type="link"
                              danger
                              onClick={() => remove(field.name)}
                              style={{ padding: 0, marginLeft: 4 }}
                              icon={<span style={{ fontWeight: 'bold' }}>×</span>}
                            />
                          </Tooltip>
                        </div>
                      </Col>
                    );
                  })}
                  <Col>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Thêm giờ
                    </Button>
                  </Col>
                </Row>
              )}
            </Form.List>
          </Form.Item>
        ))}

        <Divider />
        <Form.Item>
          <div className="flex gap-3 justify-end">
            <Button onClick={onCancel} disabled={loading} danger>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo suất chiếu
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShowTimeCreate;