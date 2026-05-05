import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  InboxOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { deleteCinema, getAllCinemas } from "../../../service/cinema";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import AddCinema from "./AddCinema";
import EditCinema from "./EditCinema";

const CinemaManagement = ({ addModalVisible, setAddModalVisible }) => {
  const [loading, setLoading] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });

  const [showAdd, setShowAdd] = useState(false);
  const modalVisible = addModalVisible !== undefined ? addModalVisible : showAdd;
  const setModalVisible = setAddModalVisible !== undefined ? setAddModalVisible : setShowAdd;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const response = await getAllCinemas();
      if (response.success) {
        setCinemas(Array.isArray(response.data) ? response.data : []);
      } else {
        showErrorToast(response.message || "Khong lay duoc danh sach rap phim");
      }
    } catch (error) {
      showErrorToast("Mat ket noi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const filteredCinemas = useMemo(() => {
    if (!searchText) return cinemas;
    const keyword = searchText.toLowerCase();

    return cinemas.filter(
      (cinema) =>
        cinema.name?.toLowerCase().includes(keyword) ||
        cinema.address?.toLowerCase().includes(keyword) ||
        cinema.city?.toLowerCase().includes(keyword)
    );
  }, [cinemas, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredCinemas.length / pagination.pageSize));
  const currentPage = Math.min(pagination.current, totalPages);
  const startIdx = (currentPage - 1) * pagination.pageSize;
  const pageData = filteredCinemas.slice(startIdx, startIdx + pagination.pageSize);

  const handleDeleteConfirm = async () => {
    if (!selectedCinema) return;

    const response = await deleteCinema(selectedCinema.cinemaId);
    if (response.success) {
      showSuccessToast(response.message || "Xoa rap phim thanh cong");
      fetchCinemas();
    } else {
      showErrorToast(response.message || "Xoa rap phim that bai");
    }

    setDeleteModalVisible(false);
    setSelectedCinema(null);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-600">Tong rap phim: {filteredCinemas.length}</div>
        <div className="relative">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <input
            placeholder="Tim kiem rap phim..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            className="pl-10 w-72 h-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-sm shadow-sm"
            style={{ color: "black", backgroundColor: "white" }}
          />
        </div>
      </div>

      {pageData.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-12 text-center border border-gray-200">
          <InboxOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Khong tim thay rap phim nao</h3>
          <p className="text-gray-500">Thu thay doi bo loc hoac them rap phim moi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pageData.map((cinema) => (
            <div
              key={cinema.cinemaId}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-gray-200 hover:border-blue-300"
            >
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100">
                <div className="flex items-center gap-2">
                  <HomeOutlined className="text-blue-600" />
                  <span className="font-bold text-blue-700">{cinema.name}</span>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-br from-white to-blue-50">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs gap-2">
                    <span className="text-gray-500">Thanh pho:</span>
                    <span className="text-gray-700 text-right">{cinema.city || "-"}</span>
                  </div>
                  <div className="flex justify-between text-xs gap-2">
                    <span className="text-gray-500">Dia chi:</span>
                    <span className="text-gray-700 text-right">{cinema.address}</span>
                  </div>
                  <div className="flex justify-between text-xs gap-2">
                    <span className="text-gray-500">So phong:</span>
                    <span className="text-green-700 font-bold">{cinema.totalRooms || 0}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Tooltip title="Chinh sua">
                    <Button
                      size="small"
                      icon={<EditOutlined className="text-blue-600" />}
                      onClick={() => {
                        setSelectedCinema(cinema);
                        setEditModalVisible(true);
                      }}
                      className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400 hover:text-blue-800 shadow-sm bg-gradient-to-r from-blue-100 to-indigo-100"
                    />
                  </Tooltip>
                  <Tooltip title="Xoa">
                    <Button
                      size="small"
                      icon={<DeleteOutlined className="text-red-600" />}
                      onClick={() => {
                        setSelectedCinema(cinema);
                        setDeleteModalVisible(true);
                      }}
                      className="flex-1 border-red-300 text-red-700 hover:border-red-400 hover:text-red-800 shadow-sm bg-gradient-to-r from-red-100 to-rose-100"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-end items-center gap-2 mt-4">
        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center ${
            currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-blue-700 hover:bg-blue-100"
          }`}
          disabled={currentPage === 1}
          onClick={() => setPagination((prev) => ({ ...prev, current: prev.current - 1 }))}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center ${
              currentPage === page
                ? "bg-gradient-to-br from-blue-500 to-indigo-700 text-white scale-105"
                : "bg-white text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setPagination((prev) => ({ ...prev, current: page }))}
          >
            {page}
          </button>
        ))}

        <button
          className={`w-9 h-9 rounded-xl font-bold shadow transition flex items-center justify-center ${
            currentPage === totalPages || filteredCinemas.length === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-blue-700 hover:bg-blue-100"
          }`}
          disabled={currentPage === totalPages || filteredCinemas.length === 0}
          onClick={() => setPagination((prev) => ({ ...prev, current: prev.current + 1 }))}
        >
          &gt;
        </button>

        <select
          className="ml-4 rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white text-blue-700 border-blue-200"
          value={pagination.pageSize}
          onChange={(e) => setPagination({ current: 1, pageSize: Number(e.target.value) })}
        >
          {[8, 16, 32].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <Modal
        title="Them rap phim moi"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={560}
        className="!rounded-xl"
      >
        <AddCinema
          onSuccess={() => {
            setModalVisible(false);
            fetchCinemas();
          }}
          onClose={() => setModalVisible(false)}
        />
      </Modal>

      <Modal
        title="Chinh sua rap phim"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedCinema(null);
        }}
        footer={null}
        width={560}
        className="!rounded-xl"
      >
        <EditCinema
          cinema={selectedCinema}
          onSuccess={() => {
            setEditModalVisible(false);
            setSelectedCinema(null);
            fetchCinemas();
          }}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedCinema(null);
          }}
        />
      </Modal>

      <Modal
        title="Xac nhan xoa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedCinema(null);
        }}
        okText="Xoa"
        cancelText="Huy"
        okButtonProps={{ danger: true, loading }}
        className="!rounded-xl"
      >
        <p>Ban co chac chan muon xoa rap phim "{selectedCinema?.name}"?</p>
        <p className="text-red-500 font-medium">Hanh dong nay khong the hoan tac.</p>
      </Modal>
    </>
  );
};

export default CinemaManagement;


