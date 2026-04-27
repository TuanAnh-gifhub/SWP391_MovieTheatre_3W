import React from "react";
import { Switch } from "antd";

/**
 * MultiSwitch: Công tắc bật/tắt nhiều phim hoặc tất cả phim.
 * @param {boolean} checked - Trạng thái hiện tại (bật/tắt).
 * @param {function} onChange - Hàm xử lý khi chuyển trạng thái.
 * @param {boolean} loading - Trạng thái loading.
 */
const MultiSwitch = ({ checked, onChange, loading }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    loading={loading}
    checkedChildren="Bật"
    unCheckedChildren="Tắt"
    
    style={{ marginRight: 12, minWidth: 70 }} // tăng minWidth
  />
);

export default MultiSwitch;