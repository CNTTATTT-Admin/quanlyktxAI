import React, { useEffect, useState } from "react";
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

function RoomHired(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [reason, setReason] = useState("");

  // Fetch data from the API
  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [currentPage, authenticated, currentUser]);

  const fetchData = () => {
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

  // Hàm helper format ngày tháng sang chuẩn Việt Nam
  const formatDate = (dateInput) => {
    if (!dateInput) return "Chưa cập nhật";
    const date = new Date(dateInput);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <div style={{ marginTop: "140px" }}></div>
      <main id="main">
        <div className="wrapper">
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <br />
            <div className="container-fluid p-4">
              {/* CARD ECOHOME */}
              <div className="card eco-card">
                <div className="card-header eco-card-header">
                  <h4 className="card-title fw-bold text-dark mb-1"><i className="bi bi-clock-history text-emerald me-2"></i>Lịch sử thuê phòng</h4>
                  <h6 className="card-subtitle text-muted mb-0">
                    Hiển thị chi tiết hợp đồng và lịch sử thuê phòng của bạn.
                  </h6>
                </div>
                
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table eco-table compact-table mb-0" style={{ width: "100%" }}>
                      <thead>
                        <tr>
                          {/* Đã giảm minWidth để các cột sát nhau hơn */}
                          <th style={{ minWidth: "140px", paddingLeft: "24px" }}>Tên Phòng</th>
                          <th style={{ minWidth: "120px" }}>Người thuê</th>
                          <th style={{ minWidth: "100px" }}>SĐT</th>
                          <th style={{ minWidth: "100px" }}>Giá thuê</th>
                          <th style={{ minWidth: "110px" }}>Ngày tạo</th>
                          <th style={{ minWidth: "110px" }}>Hết hạn</th>
                          <th style={{ minWidth: "80px", textAlign: "center" }}>Còn lại</th>
                          <th style={{ minWidth: "150px" }}>Bạn cùng phòng</th>
                          <th style={{ minWidth: "100px" }}>Trạng Thái</th>
                          <th style={{ minWidth: "100px", paddingRight: "24px", textAlign: "center" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.length === 0 ? (
                          <tr>
                            <td colSpan="10" style={{ textAlign: "center", padding: "3rem" }}>
                              <i className="bi bi-folder-x text-muted fs-1 mb-2 d-block opacity-50"></i>
                              <span className="text-muted fw-semibold">Bạn chưa có lịch sử thuê phòng nào.</span>
                            </td>
                          </tr>
                        ) : (
                          tableData.map((item, index) => {
                            const isLatestContract = currentPage === 1 && index === 0;

                            return (
                              <tr key={item.id}>
                                <td style={{ paddingLeft: "24px" }}>
                                  <a
                                    href={`/rental-home/` + item.room?.id}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="fw-bold text-emerald text-decoration-none"
                                  >
                                    {item.room?.title}
                                  </a>
                                </td>
                                <td><span className="fw-semibold text-dark">{item.nameOfRent}</span></td>
                                <td>{item.phone}</td>
                                <td className="fw-bold text-danger">
                                  {item.room?.price &&
                                    item.room.price.toLocaleString("vi-VN")} đ
                                </td>
                                <td>{formatDate(item.createdAt)}</td>
                                <td>{formatDate(item.deadlineContract)}</td>
                                <td className="text-center">
                                  <span className="badge bg-light border border-info text-info rounded-pill fw-bold">
                                    {calculateRemainingMonths(item.deadlineContract)} tháng
                                  </span>
                                </td>
                                <td>
                                  {item.room?.residents &&
                                  item.room.residents.length > 1 ? (
                                    <ul className="list-unstyled mb-0">
                                      {item.room.residents
                                        .filter((r) => r.id !== currentUser?.id)
                                        .map((r) => (
                                          <li
                                            key={r.id}
                                            style={{ fontSize: "0.8rem" }}
                                            className="text-muted text-truncate"
                                          >
                                            • {r.name}
                                          </li>
                                        ))}
                                    </ul>
                                  ) : (
                                    <span className="text-muted fst-italic small">Chưa có</span>
                                  )}
                                </td>
                                <td>
                                  {item.room?.status === "FULL" || item.room?.status === "PARTIALLY_FILLED" || item.room?.status === "ROOM_RENT" ? (
                                    <span className="badge bg-emerald rounded-pill px-3 shadow-sm">Đang ở</span>
                                  ) : (
                                    <span className="badge bg-secondary rounded-pill px-3 shadow-sm">
                                      {item.room?.status === "MAINTENANCE" || item.room?.status === "CHECKED_OUT" ? "Đã trả phòng" : "Đã rời"}
                                    </span>
                                  )}
                                </td>
                                <td className="text-center" style={{ paddingRight: "24px" }}>
                                  {isLatestContract && (item.room?.status === "FULL" || item.room?.status === "PARTIALLY_FILLED" || item.room?.status === "ROOM_RENT") ? (
                                    <button
                                      className="btn btn-sm btn-outline-danger rounded-pill fw-bold btn-modern"
                                      onClick={() => handleOpenModal(item.room?.id)}
                                    >
                                      Yêu cầu rời
                                    </button>
                                  ) : (
                                    <span className="text-muted small fst-italic">-</span>
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

      {/* Modal Yêu Cầu Rời Phòng (Giao diện Eco) */}
      {showModal && (
        <div
          className="modal show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark fs-4">Yêu cầu trả phòng</h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">Lý do rời phòng chi tiết <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control bg-light border-0 p-3"
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ví dụ: Chuyển chỗ làm, Hết nhu cầu thuê..."
                      required
                      style={{ resize: "none", borderRadius: "12px" }}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-center gap-2 pb-4">
                <button
                  type="button"
                  className="btn btn-light rounded-pill fw-bold px-4 btn-modern text-muted"
                  onClick={handleCloseModal}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill fw-bold px-4 btn-modern shadow-sm"
                  onClick={submitLeaveRequest}
                >
                  <i className="bi bi-send-fill me-2"></i> Gửi yêu cầu
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