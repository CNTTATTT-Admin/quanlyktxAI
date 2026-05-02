import React, { useEffect, useState, useCallback } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  getCheckoutRequestsForRentaler,
  approveCheckoutRequest,
  rejectCheckoutRequest,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import moment from "moment";
import useAutoReload from "../../hooks/useAutoReload";

function CheckoutRequestManagement(props) {
  const { authenticated, currentUser, location, onLogout } = props;

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback(() => {
    getCheckoutRequestsForRentaler(currentPage, itemsPerPage)
      .then((response) => {
        setTableData(response?.content || []);
        setTotalItems(response?.totalElements || 0);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Không thể tải danh sách yêu cầu trả phòng.",
        );
      });
  }, [currentPage, itemsPerPage]);

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

  const handleUpdateStatus = (id, status) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn ${status === "APPROVED" ? "duyệt trả phòng" : "từ chối yêu cầu"} này?`,
      )
    )
      return;

    const requestApi =
      status === "APPROVED"
        ? approveCheckoutRequest(id)
        : rejectCheckoutRequest(id);
    requestApi
      .then((response) => {
        toast.success(
          response?.message ||
            `Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} yêu cầu trả phòng.`,
        );
        notifyDataUpdated();
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Gặp lỗi khi cập nhật trạng thái.",
        );
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!props.authenticated) {
    return (
      <Navigate
        to={{ pathname: "/login-rentaler", state: { from: location } }}
      />
    );
  }

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        /* Table Styles */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
        .eco-table { margin-bottom: 0; width: 100%; min-width: 900px; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; padding: 16px 20px; border: none; white-space: nowrap; vertical-align: middle; }
        .eco-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.95rem; white-space: nowrap; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }
        
        /* Buttons */
        .btn-action-table { transition: all 0.2s; font-size: 0.85rem; padding: 8px 16px; }
        .btn-action-table:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        {/* TIÊU ĐỀ & MÔ TẢ */}
        <div className="row mb-4 align-items-center">
          <div className="col-12">
            <h2 className="fw-bolder text-dark mb-1">Quản lý Yêu cầu trả phòng</h2>
            <p className="text-muted mb-0">Duyệt hoặc từ chối các yêu cầu trả phòng của người thuê.</p>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="modern-table-wrapper mb-4">
          <table className="table table-hover eco-table">
            <thead>
              <tr>
                <th className="ps-4">Phòng</th>
                <th>Người trả</th>
                <th>Lý do</th>
                <th>Ngày yêu cầu</th>
                <th>Trạng thái</th>
                <th className="text-center pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!tableData || tableData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-box-arrow-right fs-1 d-block mb-3 opacity-50" style={{fontSize: "2.5rem"}}></i>
                      <span style={{fontSize: "1rem"}}>Chưa có yêu cầu trả phòng nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4">
                        <span className="badge bg-light text-dark border rounded-pill px-3 py-2 fs-6 shadow-sm">
                            <i className="bi bi-door-open text-emerald me-2"></i>
                            {item.room?.title}
                        </span>
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
                      <div className="text-truncate text-secondary" style={{ maxWidth: "250px" }} title={item.reason}>
                        {item.reason || "-"}
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium">
                        <i className="bi bi-clock-history text-muted me-2"></i>
                        {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </td>
                    <td>
                        {item.status === "PENDING" && (
                            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm">
                                <i className="bi bi-hourglass-split me-1"></i> Chờ duyệt
                            </span>
                        )}
                        {item.status === "APPROVED" && (
                            <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm">
                                <i className="bi bi-check-circle-fill me-1"></i> Đã duyệt
                            </span>
                        )}
                        {item.status === "REJECTED" && (
                            <span className="badge bg-danger text-white rounded-pill px-3 py-2 shadow-sm">
                                <i className="bi bi-x-circle-fill me-1"></i> Từ chối
                            </span>
                        )}
                    </td>
                    <td className="text-center pe-4">
                      {item.status === "PENDING" ? (
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-primary shadow-sm rounded-pill fw-semibold btn-action-table"
                            onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                            title="Đồng ý trả phòng"
                          >
                            <i className="bi bi-check2 me-1"></i> Duyệt
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger shadow-sm rounded-pill fw-semibold btn-action-table"
                            onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                            title="Từ chối yêu cầu"
                          >
                            <i className="bi bi-x-lg me-1"></i> Từ chối
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
    </>
  );
}

export default CheckoutRequestManagement;