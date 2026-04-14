import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle, FiClock, FiCheck, FiX } from "react-icons/fi";
import { getAllInvoices, updateInvoiceStatus } from "../../services/fetch/ApiUtils";
import { formatVnd } from "../../utils/currency";

const AUTO_RELOAD_INTERVAL_MS = 15000;

const InvoiceManagement = (props) => {
  const { authenticated, location } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated, fetchData]);

  const fetchData = useCallback(() => {
    getAllInvoices(currentPage - 1, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content || []);
        setTotalItems(response.totalElements || 0);
      })
      .catch((error) => {
        toast.error((error && error.message) || "Không thể tải danh sách hóa đơn.");
      });
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    if (!authenticated) return;

    const refreshOnEvent = () => {
      fetchData();
    };

    const refreshOnVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    window.addEventListener("invoice-updated", refreshOnEvent);
    window.addEventListener("focus", refreshOnEvent);
    window.addEventListener("storage", refreshOnEvent);
    document.addEventListener("visibilitychange", refreshOnVisibility);

    const intervalId = window.setInterval(fetchData, AUTO_RELOAD_INTERVAL_MS);

    return () => {
      window.removeEventListener("invoice-updated", refreshOnEvent);
      window.removeEventListener("focus", refreshOnEvent);
      window.removeEventListener("storage", refreshOnEvent);
      document.removeEventListener("visibilitychange", refreshOnVisibility);
      window.clearInterval(intervalId);
    };
  }, [authenticated, fetchData]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm xác nhận thu tiền mặt (Chuyển từ PENDING -> PAID)
  const handleMarkAsPaid = (id) => {
    if (window.confirm("Xác nhận người thuê đã thanh toán tiền mặt cho hóa đơn này?")) {
      updateInvoiceStatus(id, "PAID")
        .then(() => {
          toast.success("Đã xác nhận thu tiền thành công!");
          localStorage.setItem("invoice-updated-at", String(Date.now()));
          window.dispatchEvent(new Event("invoice-updated"));
          fetchData();
        })
        .catch((error) => toast.error(error.message || "Lỗi khi cập nhật hóa đơn."));
    }
  };

  // Hàm hủy hóa đơn (Chuyển từ PENDING -> CANCELLED)
  const handleCancelInvoice = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này không?")) {
      updateInvoiceStatus(id, "CANCELLED")
        .then(() => {
          toast.success("Đã hủy hóa đơn!");
          localStorage.setItem("invoice-updated-at", String(Date.now()));
          window.dispatchEvent(new Event("invoice-updated"));
          fetchData();
        })
        .catch((error) => toast.error(error.message || "Lỗi khi hủy hóa đơn."));
    }
  };

  const openInvoiceModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING": return <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm"><FiClock className="me-1 mb-1" /> Chờ thanh toán</span>;
      case "PAID": return <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm"><FiCheckCircle className="me-1 mb-1" /> Đã thu</span>;
      case "FAILED": return <span className="badge bg-danger text-white rounded-pill px-3 py-2 shadow-sm"><FiXCircle className="me-1 mb-1" /> Thất bại</span>;
      case "CANCELLED": return <span className="badge bg-secondary text-white rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-slash-circle me-1 mb-1"></i> Đã hủy</span>;
      default: return <span className="badge bg-light text-dark rounded-pill px-3 py-2 shadow-sm">{status}</span>;
    }
  };

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-input-search { border-radius: 50px; padding: 10px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 0.95rem; }
        .modern-input-search:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        
        .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.9rem; padding: 8px 20px; }
        .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }

        /* Table Styles */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
        .eco-table { margin-bottom: 0; width: 100%; min-width: 1000px; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; padding: 16px 20px; border: none; white-space: nowrap; vertical-align: middle; }
        .eco-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.95rem; white-space: nowrap; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }

        .btn-action-table { transition: all 0.2s; font-size: 0.85rem; padding: 6px 16px; border-radius: 50px; font-weight: 600; }
        .btn-action-table:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

        .modal-eco .modal-content { border-radius: 20px; border: none; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
      `}</style>

      <div className="container-fluid p-4 eco-bg">

        {/* TIÊU ĐỀ & MÔ TẢ */}
        <div className="row mb-4 align-items-center">
          <div className="col-12">
            <h2 className="fw-bolder text-dark mb-1">Quản lý Hóa Đơn Bãi Xe</h2>
            <p className="text-muted mb-0">Theo dõi dòng tiền, xác nhận thu tiền cước gửi xe của người thuê.</p>
          </div>
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="row mb-4">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="position-relative shadow-sm rounded-pill">
              <input
                type="search"
                className="form-control modern-input-search w-100 pe-5"
                placeholder="Tìm tên hoặc biển số xe..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted" style={{ fontSize: "1.1rem" }}></i>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="modern-table-wrapper mb-4">
          <table className="table table-hover eco-table">
            <thead>
              <tr>
                <th className="ps-4">Mã GD</th>
                <th>Người thanh toán</th>
                <th>Chi tiết Thẻ xe</th>
                <th>Số tiền</th>
                <th>Thời gian</th>
                <th>Phương thức</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-receipt-cutoff fs-1 d-block mb-3 opacity-50" style={{ fontSize: "2.5rem" }}></i>
                      <span style={{ fontSize: "1rem" }}>Không có dữ liệu hóa đơn nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4">
                      <small className="text-muted font-monospace fw-bold bg-light p-1 rounded border">
                        {item.transactionId || `#INV-${item.id}`}
                      </small>
                      <div>
                        <button
                          className="btn btn-sm btn-link p-0 text-decoration-none text-primary fw-bold"
                          onClick={() => openInvoiceModal(item)}
                        >
                          <i className="bi bi-info-circle me-1"></i> Chi tiết
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark d-flex align-items-center">
                        <i className="bi bi-person-circle text-emerald me-2 fs-5"></i>
                        {item.user?.name}
                      </div>
                      <small className="text-muted ms-4 ps-1">
                        <i className="bi bi-telephone-fill me-1"></i> {item.user?.phone}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-dark rounded-pill px-3 shadow-sm mb-1">{item.parkingCard?.licensePlate}</span><br />
                      <small className="text-muted fw-medium">
                        <i className="bi bi-tag-fill me-1 text-emerald"></i> {item.parkingCard?.packageInfo?.name}
                      </small>
                    </td>
                    <td className="text-danger fw-bolder fs-5">
                      {formatVnd(item.amount)}
                    </td>
                    <td>
                      <div className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                        <span className="fw-bold text-dark">Tạo:</span> {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "-"}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        <span className="fw-bold text-dark">Thu:</span> {item.paidAt ? new Date(item.paidAt).toLocaleString("vi-VN") : "-"}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        <span className="fw-bold text-dark">Cập nhật:</span> {item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "-"}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border rounded-pill px-3 py-2 shadow-sm">
                        {item.status === "PENDING" ? "Chưa thanh toán" :
                          item.status === "CANCELLED" ? "-" :
                            (item.paymentMethod || "Tiền mặt")}
                      </span>
                    </td>
                    <td className="text-center">{getStatusBadge(item.status)}</td>
                    <td className="text-center pe-4">
                      {item.status === "PENDING" ? (
                        <div className="d-flex flex-column gap-2 align-items-center">
                          <button
                            className="btn btn-success shadow-sm btn-action-table w-100 d-flex justify-content-center align-items-center"
                            onClick={() => handleMarkAsPaid(item.id)}
                            title="Xác nhận đã thu tiền mặt"
                          >
                            <FiCheck className="me-1 fs-5" /> Thu tiền
                          </button>
                          <button
                            className="btn btn-outline-danger bg-white shadow-sm btn-action-table w-100 d-flex justify-content-center align-items-center"
                            onClick={() => handleCancelInvoice(item.id)}
                            title="Hủy hóa đơn này"
                          >
                            <FiX className="me-1 fs-5" /> Hủy GD
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">Đã xử lý</span>
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
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            currentPage={currentPage}
            paginate={paginate}
          />
        </div>

      </div>

      {showInvoiceModal && selectedInvoice && (
        <div className="modal fade show d-block modal-eco" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-white border-bottom p-4">
                <h5 className="modal-title fw-bolder text-dark d-flex align-items-center">
                  <i className="bi bi-receipt-cutoff text-emerald me-2 fs-4"></i>
                  Hóa đơn #{selectedInvoice.id}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                    <span className="text-muted fw-semibold">Tổng tiền thanh toán:</span>
                    <strong className="text-danger fs-4">
                      {formatVnd(selectedInvoice.amount)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Người thanh toán:</span>
                    <strong className="text-dark">{selectedInvoice.user?.name || "-"}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Biển số xe:</span>
                    <span className="fw-bold bg-dark text-white px-2 py-1 rounded small">
                      {selectedInvoice.parkingCard?.licensePlate || "-"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Trạng thái giao dịch:</span>
                    <span>{getStatusBadge(selectedInvoice.status)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Phương thức thanh toán:</span>
                    <strong className="text-dark">{selectedInvoice.paymentMethod || "-"}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Mã giao dịch (VNPAY):</span>
                    <span className="font-monospace fw-bold">{selectedInvoice.transactionId || "-"}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Thời gian thu tiền:</span>
                    <span className="text-dark fw-medium">
                      {selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString("vi-VN") : "Chưa thanh toán"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-white border-top p-3">
                <button type="button" className="btn btn-light border text-secondary btn-modern w-100 fw-bold py-2" onClick={() => setShowInvoiceModal(false)}>
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceManagement;