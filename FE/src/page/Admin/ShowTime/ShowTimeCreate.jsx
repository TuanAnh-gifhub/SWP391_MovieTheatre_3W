import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Select, TimePicker, Input, Modal, Row, Col, Divider, Tooltip, Checkbox } from 'antd';
import { createShowtime, fetchAllRooms, fetchAvailableDates, suggestValidateTime } from '../../../service/showtime';
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
  const [suggestedTimes, setSuggestedTimes] = useState({});
  const formRef = useRef();

  useEffect(() => {
    if (movieIdToUse) {
      form.setFieldsValue({ movieId: Number(movieIdToUse) });
      fetchAvailableDates(movieIdToUse).then(response => {
        if (!response.error) {
          setAvailableDates(response.result);
        } else {
          setAvailableDates([]);
          toast.error(response.message || 'Không thể tìm được ngày có sẵn!');
        }
      });
    }
  }, [movieIdToUse, form, visible]);

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

  // Áp dụng giờ gợi ý cho từng ngày
  const handleApplySuggest = async (date) => {
    const cinemaRoomId = form.getFieldValue('cinemaRoomID');
    if (!cinemaRoomId || !movieIdToUse) return;
    const res = await suggestValidateTime({
      date,
      cinemaRoomId,
      movieId: Number(movieIdToUse),
    });
    if (!res.error && Array.isArray(res.result)) {
      // Lưu cả startTime và endTime
      setSuggestedTimes(prev => ({
        ...prev,
        [date]: res.result.map(t => ({
          startTime: t.startTime,
          endTime: t.endTime
        }))
      }));
      const times = form.getFieldValue('times') || {};
      times[date] = res.result.map(t => dayjs(t.startTime, 'HH:mm:ss'));
      form.setFieldsValue({ times });
    } else {
      toast.error(res.message || "Không lấy được giờ gợi ý!");
    }
  };

  // Submit tạo suất chiếu
  const onFinish = async (values) => {
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
      setCinemas([]);
      setCinemaRooms([]);
      setSelectedDates([]);
      setSuggestedTimes({});
    }
  }, [visible, form]);

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
          <Col span={12}>
            <Form.Item
              name="movieId"
              label={<span><VideoCameraOutlined /> Phim</span>}
              rules={[{ required: true, message: 'Vui lòng chọn phim' }]}
            >
              <Input disabled placeholder="ID phim sẽ tự động điền" />
            </Form.Item>
          </Col>
          <Col span={12}>
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
              label={<span><EnvironmentOutlined /> Thành phố</span>}
              rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
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
          extra="Chọn nhiều ngày, mỗi ngày áp dụng gợi ý riêng."
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
                <Button
                  size="small"
                  style={{ marginLeft: 12 }}
                  onClick={() => handleApplySuggest(date)}
                >
                  Áp dụng giờ gợi ý
                </Button>
              </span>
            }
            required
            style={{ marginBottom: 0 }}
            extra={
              suggestedTimes[date]?.length > 0
                ? (
                  <span>
                    Giờ gợi ý:&nbsp;
                    {suggestedTimes[date]
                      .map(
                        t =>
                          `${t.startTime?.slice(0, 5)} - ${t.endTime?.slice(0, 5)}`
                      )
                      .join(', ')}
                    <br />
                    Bạn có thể chỉnh sửa, xóa hoặc thêm giờ mới.
                  </span>
                )
                : "Bạn có thể thêm nhiều giờ chiếu cho ngày này."
            }
          >
            <Form.List name={['times', date]}>
              {(fields, { add, remove }) => (
                <Row gutter={8} align="middle">
                  {fields.map((field, idx) => {
                    let endTime = null;
                    const suggested = suggestedTimes[date];
                    const value = form.getFieldValue(['times', date, field.name]);
                    if (suggested && value) {
                      const found = suggested.find(
                        t => dayjs(t.startTime, 'HH:mm:ss').format('HH:mm') === dayjs(value).format('HH:mm')
                      );
                      if (found) endTime = found.endTime;
                    }
                    return (
                      <Col key={field.key}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {endTime ? (
                            <div
                              style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: 6,
                                padding: '4px 12px',
                                minWidth: 90,
                                background: '#fafafa',
                                fontSize: 15,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {`${dayjs(value).format('HH:mm')} - ${dayjs(endTime, 'HH:mm:ss').format('HH:mm')}`}
                            </div>
                          ) : (
                            <Form.Item
                              key={field.key}
                              {...field}
                              rules={[{ required: true, message: 'Vui lòng chọn giờ chiếu' }]}
                              noStyle
                            >
                              <TimePicker format="HH:mm" />
                            </Form.Item>
                          )}
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