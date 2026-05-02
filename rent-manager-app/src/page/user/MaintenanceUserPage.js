import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarNav from "./SidebarNav";
import {
  reportMaintenance,
  getMaintenanceHistoryForUser,
  getRoom,
} from "../../services/fetch/ApiUtils";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Pagination from "./Pagnation";
import { formatVnd } from "../../utils/currency";
import useAutoReload from "../../hooks/useAutoReload";

function MaintenanceUserPage(props) {
  
  const { authenticated, currentUser, location, onLogout } = props;

  const [maintenanceData, setMaintenanceData] = useState({
    roomId: "",
    description: "",
    files: [],
  });

  const [tableData, setTableData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUserRooms = useCallback(() => {
    const allocatedRoomId = currentUser?.allocatedRoomId;
    if (!allocatedRoomId) {
      setRooms([]);
      return;
    }
    getRoom(allocatedRoomId)
      .then((room) => {
        setRooms([room]);
        setMaintenanceData((prev) => ({
          ...prev,
          roomId: room.id,
        }));
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải thông tin phòng.",
        );
      });
  }, [currentUser]);

  const fetchMaintenanceHistory = useCallback(() => {
    getMaintenanceHistoryForUser(currentPage, itemsPerPage)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải lịch sử bảo trì.",
        );
      });
  }, [currentPage, itemsPerPage]);

  const refreshData = useCallback(() => {
    fetchUserRooms();
    fetchMaintenanceHistory();
  }, [fetchMaintenanceHistory, fetchUserRooms]);

  useEffect(() => {
    if (authenticated) {
      refreshData();
    }
  }, [authenticated, refreshData]);

  useAutoReload({ enabled: authenticated, onReload: refreshData });

  const notifyDataUpdated = () => {
    localStorage.setItem("app-data-updated-at", String(Date.now()));
    window.dispatchEvent(new Event("app-data-updated"));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMaintenanceData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    setMaintenanceData((prevState) => ({
      ...prevState,
      files: [...event.target.files],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!maintenanceData.roomId) {
      toast.warning("Vui lòng chọn phòng cần bảo trì.");
      return;
    }

    reportMaintenance(maintenanceData)
      .then((response) => {
        toast.success("Gửi yêu cầu bảo trì thành công!");
        setMaintenanceData({
          roomId: rooms.length === 1 ? rooms[0].id : "",
          description: "",
          files: [],
        });
        notifyDataUpdated();
        fetchMaintenanceHistory();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
  }

  // Cập nhật giao diện Badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return <span className="eco-badge eco-badge-success"><i className="bi bi-check-circle-fill me-1"></i> Đã hoàn thành</span>;
      case "IN_PROGRESS":
        return <span className="eco-badge eco-badge-primary"><i className="bi bi-tools me-1"></i> Đang thực hiện</span>;
      default:
        return <span className="eco-badge eco-badge-warning"><i className="bi bi-hourglass-split me-1"></i> Chờ duyệt</span>;
    }
  };

  return (
    <>
      <style>{`
        .eco-page-bg {
          background-color: #F8FAFC;
          min-height: calc(100vh - 70px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          display: flex;
          flex-direction: column;
        }

        .wrapper { display: flex; align-items: stretch; width: 100%; flex-grow: 1; }
        
        #sidebar.sidebar {
          background-color: #ffffff !important; position: relative !important; align-self: stretch !important; 
          min-height: 100% !important; width: 260px !important; min-width: 260px !important; max-width: 260px !important;
          border-right: 1px solid #EEF2FF; z-index: 1000; top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
        }

        .sidebar-content {
          position: sticky !important; top: 70px !important; height: calc(100vh - 70px) !important;
          overflow-y: auto !important; background-color: #ffffff !important; display: flex; flex-direction: column;
        }
        
        .sidebar-content::-webkit-scrollbar { width: 4px; }
        .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

        .main { flex-grow: 1; min-width: 0; }

        .eco-main-wrapper { padding: 30px; width: 100%; }

        .eco-card {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF; overflow: hidden; height: 100%; display: flex; flex-direction: column;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
          display: flex; justify-content: space-between; align-items: center;
        }

        .eco-title-icon { color: #4F46E5; margin-right: 10px; font-size: 1.3rem; }

        .eco-table { margin-bottom: 0; color: #1E293B; }
        .eco-table thead th {
          background-color: #F8FAFC; color: #64748B; font-size: 0.85rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px; padding: 16px 20px;
          border-bottom: 1px solid #E2E8F0; border-top: none; vertical-align: middle; white-space: nowrap;
        }
        .eco-table tbody td {
          padding: 18px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9;
          font-size: 0.95rem; font-weight: 500; transition: background-color 0.2s ease;
        }
        .eco-table tbody tr:hover td { background-color: #F8FAFC; }

        .eco-form-label {
          font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;
        }

        .eco-input-field {
          background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 0.95rem; color: #1E293B; transition: all 0.3s; width: 100%;
        }

        .eco-input-field:focus {
          background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); outline: none;
        }

        .eco-input-field:disabled, .eco-input-field[readonly] {
          background-color: #F1F5F9; color: #94A3B8; cursor: not-allowed;
        }

        .eco-file-upload::-webkit-file-upload-button {
          background-color: #EEF2FF; color: #4F46E5; border: none; border-radius: 8px; padding: 8px 16px; font-weight: 600; margin-right: 15px; cursor: pointer; transition: all 0.2s;
        }
        .eco-file-upload::-webkit-file-upload-button:hover { background-color: #E0E7FF; }

        .eco-btn-submit {
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff; font-weight: 600; font-size: 1rem;
          padding: 12px 24px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
          transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
        }
        .eco-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35); color: #ffffff;
        }
        .eco-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .eco-badge {
          padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700;
          display: inline-flex; align-items: center;
        }
        .eco-badge-success { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .eco-badge-warning { background-color: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
        .eco-badge-primary { background-color: #E0E7FF; color: #4F46E5; border: 1px solid #C7D2FE; }

        .eco-pagination .page-item .page-link {
          color: #475569; background-color: #ffffff; border: 1px solid #E2E8F0; padding: 8px 16px; 
          margin: 0 4px; border-radius: 8px; font-weight: 600; transition: all 0.2s ease;
        }
        .eco-pagination .page-item.active .page-link {
          z-index: 3; color: #ffffff; background-color: #4F46E5; border-color: #4F46E5; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }
        .eco-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
          background-color: #EEF2FF; color: #4F46E5; border-color: #C7D2FE;
        }
      `}</style>

      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <div style={{ marginTop: "90px" }}></div>
      
      <main id="main" className="eco-page-bg">
        <div className="wrapper">
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <div className="eco-main-wrapper">
              <div className="row g-4">
                
                {/* CỘT TRÁI: FORM YÊU CẦU */}
                <div className="col-12 col-xl-4">
                  <div className="eco-card">
                    <div className="eco-card-header">
                      <h5 className="fw-bold text-dark mb-0">
                        <i className="bi bi-wrench-adjustable eco-title-icon"></i>
                        Yêu cầu bảo trì
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="eco-form-label">Phòng bảo trì</label>
                          {rooms.length === 1 ? (
                            <input
                              type="text"
                              className="eco-input-field"
                              value={rooms[0].title}
                              readOnly
                            />
                          ) : rooms.length > 1 ? (
                            <select
                              className="eco-input-field form-select"
                              name="roomId"
                              value={maintenanceData.roomId}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Chọn phòng...</option>
                              {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                  {room.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning-emphasis p-3 rounded-3" style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                              <i className="bi bi-exclamation-triangle-fill me-2"></i>
                              Bạn chưa có hợp đồng thuê phòng nào để báo cáo bảo trì.
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <label className="eco-form-label">Mô tả lỗi <span className="text-danger">*</span></label>
                          <textarea
                            className="eco-input-field"
                            rows="5"
                            name="description"
                            value={maintenanceData.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả chi tiết thiết bị, vật dụng gặp sự cố (Vd: Quạt trần kêu to, vòi nước bị rỉ...)"
                            style={{ resize: "none" }}
                            required
                          ></textarea>
                        </div>
                        
                        <div className="mb-5">
                          <label className="eco-form-label">
                            <i className="bi bi-camera me-1"></i> Hình ảnh/Tài liệu đính kèm
                          </label>
                          <input
                            className="eco-input-field eco-file-upload p-2"
                            type="file"
                            name="files"
                            multiple
                            onChange={handleFileChange}
                          />
                          <small className="text-muted d-block mt-2" style={{fontSize: "0.85rem"}}>
                            Đính kèm ảnh giúp đội ngũ kỹ thuật đánh giá tình trạng tốt hơn.
                          </small>
                        </div>
                        
                        <button
                          type="submit"
                          className="eco-btn-submit"
                          disabled={rooms.length === 0}
                        >
                          <i className="bi bi-send-fill"></i> Gửi yêu cầu ngay
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: BẢNG LỊCH SỬ */}
                <div className="col-12 col-xl-8">
                  <div className="eco-card">
                    <div className="eco-card-header">
                      <div>
                        <h5 className="fw-bold text-dark mb-1">
                          <i className="bi bi-clipboard2-data eco-title-icon"></i>
                          Lịch sử bảo trì
                        </h5>
                        <h6 className="text-muted mb-0" style={{fontSize: "0.9rem"}}>
                          Theo dõi tiến độ các yêu cầu sửa chữa đã gửi.
                        </h6>
                      </div>
                    </div>
                    
                    <div className="card-body p-0 flex-grow-1 d-flex flex-column">
                      <div className="table-responsive">
                        <table className="table eco-table">
                          <thead>
                            <tr>
                              <th style={{ paddingLeft: "30px" }}>Phòng</th>
                              <th>Mô tả lỗi</th>
                              <th>Ngày yêu cầu</th>
                              <th>Ngày cập nhật</th>
                              <th>Chi phí</th>
                              <th style={{ paddingRight: "30px" }}>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <i className="bi bi-tools text-muted fs-1 mb-3 d-block" style={{opacity: 0.2}}></i>
                                  <span className="text-muted fw-semibold" style={{fontSize: "1.05rem"}}>Chưa có yêu cầu bảo trì nào.</span>
                                </td>
                              </tr>
                            ) : (
                              tableData.map((item) => (
                                <tr key={item.id}>
                                  <td style={{ paddingLeft: "30px" }} className="fw-bold text-dark">{item.room.title}</td>
                                  <td>
                                    <div style={{ maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.description}>
                                      {item.description}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="text-muted">
                                      <i className="bi bi-calendar3 me-1"></i>
                                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "-"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="text-muted">
                                      <i className="bi bi-calendar3 me-1"></i>
                                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("vi-VN") : "N/A"}
                                    </span>
                                  </td>
                                  <td className="fw-bold text-danger">
                                    {item.price ? formatVnd(item.price) : "-"}
                                  </td>
                                  <td style={{ paddingRight: "30px" }}>
                                    {getStatusBadge(item.status)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Phân trang tự động đẩy xuống đáy bảng */}
                      <div className="mt-auto pt-4 pb-4 d-flex justify-content-center border-top" style={{ borderColor: "#EEF2FF" }}>
                        <Pagination
                          itemsPerPage={itemsPerPage}
                          totalItems={totalItems}
                          paginate={paginate}
                          currentPage={currentPage}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default MaintenanceUserPage;