import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarNav from "./SidebarNav";
import {
  createLeaveRequest,
  getLeaveRequestsByUser,
} from "../../services/fetch/ApiUtils";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Pagination from "./Pagnation";
import useAutoReload from "../../hooks/useAutoReload";

function LeaveRequestForm(props) {

  const { authenticated, currentUser, location, onLogout } = props;

  const hasRoom = !!currentUser?.allocatedRoomId;

  const [leaveData, setLeaveData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUserRequests = useCallback(() => {
    getLeaveRequestsByUser(currentPage - 1, itemsPerPage)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải danh sách đơn nghỉ.",
        );
      });
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (authenticated) {
      fetchUserRequests();
    }
  }, [authenticated, fetchUserRequests]);

  useAutoReload({ enabled: authenticated, onReload: fetchUserRequests });

  const notifyDataUpdated = () => {
    localStorage.setItem("app-data-updated-at", String(Date.now()));
    window.dispatchEvent(new Event("app-data-updated"));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setLeaveData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!hasRoom) {
      toast.warning("Bạn chưa có phòng nên không thể nộp đơn xin nghỉ.");
      return;
    }

    // Convert date strings to ISO format for Backend
    const formattedData = {
      ...leaveData,
      startDate: leaveData.startDate ? `${leaveData.startDate}T00:00:00` : null,
      endDate: leaveData.endDate ? `${leaveData.endDate}T23:59:59` : null,
    };

    createLeaveRequest(formattedData)
      .then((response) => {
        toast.success("Gửi đơn xin nghỉ thành công!");
        setLeaveData({
          reason: "",
          startDate: "",
          endDate: "",
        });
        notifyDataUpdated();
        fetchUserRequests();
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

  const renderStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="eco-badge eco-badge-success"><i className="bi bi-check-circle-fill me-1"></i> Đã duyệt</span>;
      case "REJECTED":
        return <span className="eco-badge eco-badge-danger"><i className="bi bi-x-circle-fill me-1"></i> Từ chối</span>;
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

        .eco-form-label {
          font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;
        }

        .eco-input-field {
          background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 0.95rem; color: #1E293B; transition: all 0.3s; width: 100%;
        }

        .eco-input-field:focus {
          background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); outline: none;
        }

        /* Thêm CSS cho trạng thái disabled của input */
        .eco-input-field:disabled, .eco-input-field[readonly] {
          background-color: #F1F5F9; color: #94A3B8; cursor: not-allowed; border-color: #E2E8F0;
        }

        .eco-btn-submit {
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff; font-weight: 600; font-size: 1rem;
          padding: 12px 24px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
          transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
        }
        
        /* Cập nhật CSS disabled cho nút Submit */
        .eco-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35); color: #ffffff;
        }
        .eco-btn-submit:disabled { 
          opacity: 0.7; cursor: not-allowed; background: #94A3B8; box-shadow: none; 
        }

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

        .eco-badge {
          padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .eco-badge-success { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .eco-badge-warning { background-color: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
        .eco-badge-danger { background-color: #FFF1F2; color: #E11D48; border: 1px solid #FECDD3; }

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
                
                {/* CỘT TRÁI: FORM XIN NGHỈ */}
                <div className="col-12 col-xl-4">
                  <div className="eco-card">
                    <div className="eco-card-header">
                      <h5 className="fw-bold text-dark mb-0">
                        <i className="bi bi-calendar-minus-fill eco-title-icon"></i>
                        Viết đơn xin nghỉ
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleSubmit}>
                        
                        {/* Cảnh báo khi chưa có phòng */}
                        {!hasRoom && (
                          <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning-emphasis p-3 rounded-3 mb-4" style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Bạn chưa có hợp đồng thuê phòng nào để nộp đơn xin nghỉ.
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="eco-form-label">Ngày bắt đầu <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            className="eco-input-field"
                            name="startDate"
                            value={leaveData.startDate}
                            onChange={handleInputChange}
                            required
                            disabled={!hasRoom}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="eco-form-label">Ngày kết thúc <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            className="eco-input-field"
                            name="endDate"
                            value={leaveData.endDate}
                            onChange={handleInputChange}
                            required
                            disabled={!hasRoom}
                          />
                        </div>
                        <div className="mb-5">
                          <label className="eco-form-label">Lý do xin nghỉ <span className="text-danger">*</span></label>
                          <textarea
                            className="eco-input-field"
                            rows="4"
                            name="reason"
                            value={leaveData.reason}
                            onChange={handleInputChange}
                            placeholder="Nhập lý do nghỉ chi tiết..."
                            style={{ resize: "none" }}
                            required
                            disabled={!hasRoom}
                          ></textarea>
                        </div>
                        
                        {/* Nút Submit bị disabled nếu chưa có phòng */}
                        <button type="submit" className="eco-btn-submit" disabled={!hasRoom}>
                          <i className="bi bi-send-fill"></i> Gửi đơn xin nghỉ
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
                          <i className="bi bi-clock-history eco-title-icon"></i>
                          Lịch sử xin nghỉ
                        </h5>
                        <h6 className="text-muted mb-0" style={{fontSize: "0.9rem"}}>
                          Theo dõi trạng thái các đơn xin nghỉ bạn đã nộp.
                        </h6>
                      </div>
                    </div>
                    
                    <div className="card-body p-0 flex-grow-1 d-flex flex-column">
                      <div className="table-responsive">
                        <table className="table eco-table">
                          <thead>
                            <tr>
                              <th style={{ paddingLeft: "30px" }}>Ngày bắt đầu</th>
                              <th>Ngày kết thúc</th>
                              <th>Lý do</th>
                              <th style={{ paddingRight: "30px" }}>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="text-center py-5">
                                  <i className="bi bi-calendar-x text-muted fs-1 mb-3 d-block" style={{opacity: 0.2}}></i>
                                  <span className="text-muted fw-semibold" style={{fontSize: "1.05rem"}}>Chưa có dữ liệu đơn xin nghỉ.</span>
                                </td>
                              </tr>
                            ) : (
                              tableData.map((item) => (
                                <tr key={item.id}>
                                  <td style={{ paddingLeft: "30px" }} className="fw-bold text-indigo">
                                    <i className="bi bi-calendar-event me-2 text-muted"></i>
                                    {new Date(item.startDate).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td className="fw-bold text-indigo">
                                    <i className="bi bi-calendar-event me-2 text-muted"></i>
                                    {new Date(item.endDate).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td>
                                    <div style={{ maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.reason}>
                                      {item.reason}
                                    </div>
                                  </td>
                                  <td style={{ paddingRight: "30px" }}>
                                    {renderStatusBadge(item.status)}
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

export default LeaveRequestForm;