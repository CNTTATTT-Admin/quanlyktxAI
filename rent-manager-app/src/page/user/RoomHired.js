import React, { useEffect, useState, useCallback } from "react";
import SidebarNav from "./SidebarNav";
import {
  getAllRoomHired,
  createCheckoutRequest,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import useAutoReload from "../../hooks/useAutoReload";
import { formatVnd } from "../../utils/currency";

function RoomHired(props) {

  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [reason, setReason] = useState("");

  const fetchData = useCallback(() => {
    const phone = currentUser?.phone || "";
    getAllRoomHired(currentPage, itemsPerPage, phone)
      .then((response) => {
        setTableData(response.content || []);
        setTotalItems(response.totalElements || 0);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
    }, [currentPage, currentUser?.phone, itemsPerPage]);

    useEffect(() => {
      if (authenticated) {
        fetchData();
      }
    }, [authenticated, fetchData]);

    useAutoReload({ enabled: authenticated, onReload: fetchData });

    const notifyDataUpdated = () => {
      localStorage.setItem("app-data-updated-at", String(Date.now()));
      window.dispatchEvent(new Event("app-data-updated"));
    };

  const handleSendRequest = (id) => {
    navigate("/send-request/" + id);
  };

  const handleOpenModal = (roomId) => {
    setSelectedRoomId(roomId);
    setReason("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoomId(null);
    setReason("");
  };

  const submitLeaveRequest = () => {
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do rời phòng.");
      return;
    }
    createCheckoutRequest({
      roomId: selectedRoomId,
      reason: reason,
    })
      .then((res) => {
        toast.success(
          res?.message || "Đã gửi yêu cầu rời phòng, vui lòng chờ duyệt.",
        );
        handleCloseModal();
        notifyDataUpdated();
        fetchData(); // reload
      })
      .catch((err) => {
        toast.error((err && err.message) || "Gửi yêu cầu thất bại.");
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateRemainingMonths = (deadlineContract) => {
    if (!deadlineContract) return 0;
    const currentDate = new Date();
    const contractDate = new Date(deadlineContract);

    const remainingMonths =
      (contractDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (contractDate.getMonth() - currentDate.getMonth());

    return remainingMonths > 0 ? remainingMonths : 0;
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "Chưa cập nhật";
    const date = new Date(dateInput);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isContractEnded = (contract) => {
    if (contract?.isExpired) return true;
    if (!contract?.deadlineContract) return false;
    return new Date(contract.deadlineContract) <= new Date();
  };

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          state: { from: location },
        }}
      />
    );
  }

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

        .wrapper {
          display: flex;
          align-items: stretch;
          width: 100%;
          flex-grow: 1;
        }
        
        #sidebar.sidebar {
          background-color: #ffffff !important; 
          position: relative !important; 
          align-self: stretch !important;
          min-height: 100% !important; 
          width: 260px !important;
          min-width: 260px !important;
          max-width: 260px !important;
          border-right: 1px solid #EEF2FF;
          z-index: 1000;
          top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
        }

        .sidebar-content {
          position: sticky !important;
          top: 70px !important;
          height: calc(100vh - 70px) !important;
          overflow-y: auto !important;
          background-color: #ffffff !important;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-content::-webkit-scrollbar { width: 4px; }
        .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

        .main {
          flex-grow: 1;
          min-width: 0;
        }

        .eco-main-wrapper {
          padding: 30px;
          width: 100%;
        }

        .eco-card-table {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF; overflow: hidden;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
        }

        .eco-title-icon { color: #4F46E5; margin-right: 10px; font-size: 1.2rem; }

        .eco-table { margin-bottom: 0; color: #1E293B; }

        .eco-table thead th {
          background-color: #F8FAFC; color: #64748B; font-size: 0.8rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px; padding: 16px 12px;
          border-bottom: 1px solid #E2E8F0; border-top: none; vertical-align: middle;
          white-space: nowrap;
        }

        .eco-table tbody td {
          padding: 16px 12px; vertical-align: middle; border-bottom: 1px solid #F1F5F9;
          font-size: 0.95rem; transition: background-color 0.2s ease;
          white-space: nowrap;
        }

        .eco-table tbody tr:hover td { background-color: #F8FAFC; }

        .eco-badge { padding: 6px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; display: inline-block; }
        .eco-badge-active { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .eco-badge-inactive { background-color: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; }
        .eco-badge-months { background-color: #EEF2FF; color: #4F46E5; border: 1px solid #C7D2FE; }

        .eco-btn-action { font-size: 0.85rem; font-weight: 600; padding: 6px 14px; border-radius: 8px; transition: all 0.2s ease; }
        .eco-btn-outline-danger { color: #E11D48; background-color: transparent; border: 1px solid #FECDD3; }
        .eco-btn-outline-danger:hover { background-color: #FFF1F2; border-color: #FDA4AF; }

        /* Modal */
        .eco-modal-content { border-radius: 20px; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .eco-modal-header { border-bottom: 1px solid #EEF2FF; padding: 20px 24px; }
        .eco-modal-body { padding: 24px; }
        .eco-modal-textarea { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; font-size: 0.95rem; transition: all 0.3s; }
        .eco-modal-textarea:focus { background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); outline: none; }
        .eco-btn-danger-solid { background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); color: white; border: none; font-weight: 600; padding: 10px 24px; border-radius: 10px; transition: all 0.3s; }
        .eco-btn-danger-solid:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3); }
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
              
              <div className="eco-card-table">
                <div className="eco-card-header">
                  <h4 className="fw-bold text-dark mb-1">
                    <i className="bi bi-clock-history eco-title-icon"></i>
                    Lịch sử thuê phòng
                  </h4>
                  <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                    Hiển thị chi tiết hợp đồng và lịch sử thuê phòng của bạn.
                  </h6>
                </div>
                
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table eco-table">
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: "30px" }}>Tên Phòng</th>
                          <th>Người thuê</th>
                          <th>SĐT</th>
                          <th>Giá thuê</th>
                          <th>Ngày tạo</th>
                          <th>Hết hạn</th>
                          <th className="text-center">Còn lại</th>
                          <th>Bạn cùng phòng</th>
                          <th className="text-center">Trạng Thái</th>
                          <th className="text-center" style={{ paddingRight: "30px" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center" style={{ padding: "60px 0", whiteSpace: "normal" }}>
                              <i className="bi bi-inboxes text-muted fs-1 mb-3 d-block" style={{opacity: 0.3}}></i>
                              <span className="text-muted fw-semibold" style={{fontSize: "1.1rem"}}>Bạn chưa có lịch sử thuê phòng nào.</span>
                            </td>
                          </tr>
                        ) : (
                          tableData.map((item, index) => {
                            const isLatestContract = currentPage === 1 && index === 0;
                            const ended = isContractEnded(item);

                            return (
                              <tr key={item.id}>
                                <td style={{ paddingLeft: "30px" }}>
                                  <a
                                    href={`/rental-home/` + item.room?.id}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="fw-bold text-decoration-none"
                                    style={{color: "#4F46E5"}}
                                  >
                                    {item.room?.title}
                                  </a>
                                </td>
                                <td><span className="fw-semibold text-dark">{item.nameOfRent}</span></td>
                                <td className="text-muted">{item.phone}</td>
                                <td className="fw-bold text-danger">
                                  {formatVnd(item.room?.price)}
                                </td>
                                <td className="text-muted">{formatDate(item.createdAt)}</td>
                                <td className="text-muted">{formatDate(item.deadlineContract)}</td>
                                <td className="text-center">
                                  <span className="eco-badge eco-badge-months">
                                    {calculateRemainingMonths(item.deadlineContract)} tháng
                                  </span>
                                </td>
                                <td>
                                  {item.room?.residents && item.room.residents.length > 1 ? (
                                    <ul className="list-unstyled mb-0">
                                      {item.room.residents
                                        .filter((r) => r.id !== currentUser?.id)
                                        .map((r) => (
                                          <li
                                            key={r.id}
                                            style={{ fontSize: "0.85rem" }}
                                            className="text-muted"
                                          >
                                            <i className="bi bi-person me-1"></i>{r.name}
                                          </li>
                                        ))}
                                    </ul>
                                  ) : (
                                    <span className="text-muted fst-italic" style={{fontSize: "0.85rem"}}>Không có</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  {ended ? (
                                    <span className="eco-badge eco-badge-inactive">Đã rời</span>
                                  ) : item.room?.status === "FULL" || item.room?.status === "PARTIALLY_FILLED" || item.room?.status === "ROOM_RENT" ? (
                                    <span className="eco-badge eco-badge-active">Đang ở</span>
                                  ) : (
                                    <span className="eco-badge eco-badge-inactive">
                                      {item.room?.status === "MAINTENANCE" || item.room?.status === "CHECKED_OUT" ? "Đã trả phòng" : "Đã rời"}
                                    </span>
                                  )}
                                </td>
                                <td className="text-center" style={{ paddingRight: "30px" }}>
                                  {isLatestContract && !ended && (item.room?.status === "FULL" || item.room?.status === "PARTIALLY_FILLED" || item.room?.status === "ROOM_RENT") ? (
                                    <button
                                      className="btn eco-btn-action eco-btn-outline-danger"
                                      onClick={() => handleOpenModal(item.room?.id)}
                                    >
                                      Yêu cầu rời
                                    </button>
                                  ) : (
                                    <span className="text-muted" style={{opacity: 0.3}}>-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Phân trang */}
                  <div className="d-flex justify-content-center mt-4 pb-4">
                    <Pagination
                      itemsPerPage={itemsPerPage}
                      totalItems={totalItems}
                      currentPage={currentPage}
                      paginate={paginate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Yêu Cầu Rời Phòng */}
      {showModal && (
        <div
          className="modal show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 1050, backdropFilter: "blur(2px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content eco-modal-content">
              <div className="modal-header eco-modal-header">
                <h5 className="modal-title fw-bold text-dark fs-5">
                  <i className="bi bi-box-arrow-right text-danger me-2"></i>
                  Yêu cầu trả phòng
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body eco-modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark" style={{fontSize: "0.9rem"}}>
                      Lý do rời phòng chi tiết <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control eco-modal-textarea"
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ví dụ: Chuyển chỗ làm, Hết nhu cầu thuê..."
                      required
                      style={{ resize: "none" }}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-end gap-2 px-4 pb-4">
                <button
                  type="button"
                  className="btn btn-light fw-bold px-4 rounded-3 text-muted"
                  style={{fontSize: "0.95rem"}}
                  onClick={handleCloseModal}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="eco-btn-danger-solid"
                  onClick={submitLeaveRequest}
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default RoomHired;