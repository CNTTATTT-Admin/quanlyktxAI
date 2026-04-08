import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { getCheckInOutHistoryByRentaler, getAllRoomOfRentaler } from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";

const CheckInOutManagement = (props) => {
  // ==========================================
  // 🧠 LOGIC & STATE GIỮ NGUYÊN 100%
  // ==========================================
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { currentUser, onLogout } = props;

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedRoomId]);

  const fetchRooms = () => {
    getAllRoomOfRentaler(0, 100, "")
      .then((response) => {
        setRooms(response.content);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  };

  const fetchLogs = () => {
    getCheckInOutHistoryByRentaler(currentPage, pageSize, selectedRoomId)
      .then((response) => {
        setLogs(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error("Lỗi khi tải lịch sử điểm danh.");
      });
  };

  const handleRoomChange = (e) => {
    setSelectedRoomId(e.target.value);
    setCurrentPage(0);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  // ==========================================
  // 🎨 GIAO DIỆN MỚI (ECOHOME STYLE)
  // ==========================================
  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-input { border-radius: 50px; padding: 10px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 0.95rem; }
        .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        
        /* Table Styles */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
        .eco-table { margin-bottom: 0; width: 100%; min-width: 1000px; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; padding: 16px 20px; border: none; white-space: nowrap; vertical-align: middle; }
        .eco-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.95rem; white-space: nowrap; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        {/* TIÊU ĐỀ & MÔ TẢ */}
        <div className="row mb-4 align-items-end">
          <div className="col-md-7 col-lg-8 mb-3 mb-md-0">
            <h2 className="fw-bolder text-dark mb-1">Lịch sử điểm danh (Face ID)</h2>
            <p className="text-muted mb-0">Giám sát và kiểm tra lịch sử ra vào của người thuê thông qua hệ thống nhận diện khuôn mặt.</p>
          </div>
          
          {/* BỘ LỌC PHÒNG */}
          <div className="col-md-5 col-lg-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-funnel-fill text-emerald me-2 fs-5"></i>
              <select
                className="form-select modern-input shadow-sm w-100 fw-medium"
                value={selectedRoomId}
                onChange={handleRoomChange}
              >
                <option value="">Tất cả phòng</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Lọc theo: {room.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="modern-table-wrapper mb-4">
          <table className="table table-hover eco-table">
            <thead>
              <tr>
                <th className="ps-4">Người dùng</th>
                <th>Email liên hệ</th>
                <th>Phòng</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th className="text-center">Độ tin cậy (AI)</th>
                <th className="text-center pe-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-person-bounding-box fs-1 d-block mb-3 opacity-50" style={{fontSize: "2.5rem"}}></i>
                      <span style={{fontSize: "1rem"}}>Chưa có dữ liệu điểm danh nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="ps-4 fw-bold text-dark">
                      <i className="bi bi-person-circle text-emerald me-2"></i>
                      {log.userName}
                    </td>
                    <td className="text-secondary">
                      {log.userEmail}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border rounded-pill px-3 py-1 shadow-sm">
                        <i className="bi bi-door-open text-emerald me-2"></i>
                        {log.roomTitle || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 shadow-sm ${
                          log.checkType === "CHECK_IN"
                            ? "bg-success text-white"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {log.checkType === "CHECK_IN" ? (
                          <><i className="bi bi-box-arrow-in-right me-1"></i> CHECK_IN</>
                        ) : (
                          <><i className="bi bi-box-arrow-left me-1"></i> CHECK_OUT</>
                        )}
                      </span>
                    </td>
                    <td className="fw-medium text-dark">
                      <i className="bi bi-clock-history text-muted me-2"></i>
                      {new Date(log.checkTime).toLocaleString("vi-VN")}
                    </td>
                    <td className="text-center font-monospace fw-bold">
                      <span className={log.confidence > 0.8 ? "text-emerald" : "text-warning"}>
                        {(log.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      {log.success ? (
                        <span className="text-success fw-bold">
                          <i className="bi bi-check-circle-fill me-1"></i> Thành công
                        </span>
                      ) : (
                        <span className="text-danger fw-bold">
                          <i className="bi bi-x-circle-fill me-1"></i> Thất bại
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            itemsPerPage={pageSize}
            totalItems={totalItems}
            currentPage={currentPage + 1}
            paginate={paginate}
          />
        </div>

      </div>
    </>
  );
};

export default CheckInOutManagement;