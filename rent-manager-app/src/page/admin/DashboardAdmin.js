import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../../assets/css/app.css";
import {
  approveRoomOfAdmin,
  getAllRoomApprovingOfAdmin,
  getNumberOfAdmin,
  removeRoomOfAdmin,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import ModalRoomDetails from "./modal/ModalRoomDetail";
import { request } from "../../services/fetch/ApiUtils";
import { API_BASE_URL } from "../../constants/Connect";
import useAutoReload from "../../hooks/useAutoReload";
import { formatVnd } from "../../utils/currency";

const DashboardAdmin = (props) => {
  const { authenticated, role, location, currentUser, onLogout } = props;

  const history = useNavigate();
  const [roomId, setRoomId] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [enableLiveness, setEnableLiveness] = useState(true);

  const [number, setNumber] = useState({
    numberOfAccount: "",
    numberOfApprove: "",
    numberOfApproving: "",
    numberOfAccountLocked: "",
  });

  const fetchData = useCallback(() => {
    getAllRoomApprovingOfAdmin(currentPage, itemsPerPage, false)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
    // Fetch liveness configuration from backend
    request({
      url: `${API_BASE_URL}/auth/config/face-liveness`,
      method: "GET",
    })
      .then((response) => {
        setEnableLiveness(response === true);
      })
      .catch((error) => {
        console.error("Error fetching liveness config:", error);
      });
  }, [currentPage, fetchData, itemsPerPage]);

  useAutoReload({ enabled: authenticated, onReload: fetchData });

  const notifyDataUpdated = () => {
    localStorage.setItem("app-data-updated-at", String(Date.now()));
    window.dispatchEvent(new Event("app-data-updated"));
  };

  const handleSetRoomId = (id) => {
    setRoomId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSendEmail = (userId) => {
    history("/admin/send-email/" + userId);
  };

  const handleIsApprove = (id) => {
    approveRoomOfAdmin(id)
      .then((response) => {
        toast.success(response.message);
        notifyDataUpdated();
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleIsRemove = (id) => {
    removeRoomOfAdmin(id)
      .then((response) => {
        toast.success(response.message);
        notifyDataUpdated();
        fetchData();
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

  const handleToggleLiveness = (e) => {
    const newValue = e.target.checked;
    request({
      url: `${API_BASE_URL}/auth/config/face-liveness`,
      method: "POST",
      body: JSON.stringify({ enabled: newValue }),
    })
      .then(() => {
        setEnableLiveness(newValue);
        toast.success(
          `Đã ${newValue ? "bật" : "tắt"} xác thực chớp mắt hệ thống thành công.`,
        );
      })
      .catch((error) => {
        toast.error("Không thể cập nhật cấu hình: " + error.message);
      });
  };

  useEffect(() => {
    getNumberOfAdmin()
      .then((response) => {
        const number = response;
        setNumber((prevState) => ({
          ...prevState,
          ...number,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-admin",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .admin-dashboard-scope,
        .admin-dashboard-scope * {
          font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif;
        }

        .admin-dashboard-title {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .admin-metric-card {
          border: 1px solid #dbeafe;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          color: #0f172a;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.1);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
          position: relative;
        }

        .admin-metric-card::after {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.08);
          right: -55px;
          top: -55px;
        }

        .admin-metric-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.18);
        }

        .admin-metric-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }

        .admin-metric-label {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 600;
          opacity: 0.95;
        }

        .admin-metric-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          font-size: 1.05rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.22);
        }

        .admin-metric-value {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          position: relative;
          z-index: 1;
          letter-spacing: -0.4px;
          color: #1e3a8a;
        }

        .admin-panel-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
        }

        .admin-panel-card .card-header {
          background: transparent;
          border-bottom: 1px solid #eef2f7;
          padding: 18px 22px;
        }

        .admin-panel-card .card-title {
          margin: 0;
          color: #0f172a;
          font-weight: 700;
        }

        .admin-panel-card .card-subtitle {
          margin-top: 6px;
          color: #64748b;
        }

        .admin-liveness-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
        }

        .admin-status-chip {
          border-radius: 999px;
          font-size: 0.75rem;
          padding: 6px 10px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .admin-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          transition: all 0.2s ease;
          text-decoration: none;
          margin-right: 6px;
        }

        .admin-action-btn:hover {
          background: #eff6ff;
          color: #1d4ed8;
          transform: translateY(-1px);
        }

        .admin-action-btn.email {
          color: #2563eb;
        }

        .admin-action-btn.detail {
          color: #0f766e;
        }

        .admin-action-btn.detail:hover {
          background: #ecfeff;
          color: #0f766e;
        }

        .admin-table-shell {
          border: 1px solid #dbeafe;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.08);
          overflow: hidden;
        }

        .admin-table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
        }

        .admin-table-toolbar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e3a8a;
          font-weight: 700;
        }

        .admin-count-pill {
          background: #1d4ed8;
          color: #fff;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
        }

        .admin-table-wrap {
          overflow-x: auto;
        }

        .admin-table {
          margin-bottom: 0;
          min-width: 1080px;
        }

        .admin-table thead th {
          position: sticky;
          top: 0;
          z-index: 1;
          background: #f1f5f9;
          color: #334155;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 900;
          text-align: center;
          vertical-align: middle;
          font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
          border-color: #dbe4ef;
          padding: 12px 14px;
          white-space: nowrap;
        }

        .admin-table thead th:first-child {
          width: 56px;
          min-width: 56px;
          max-width: 56px;
          text-align: center !important;
          padding-left: 0;
          padding-right: 0;
        }

        .admin-table tbody td {
          border-color: #eef2f7;
          vertical-align: middle;
          padding: 12px 14px;
          background: #fff;
        }

        .admin-table tbody tr:nth-child(even) td {
          background: #fcfdff;
        }

        .admin-table tbody tr:hover td {
          background: #eef6ff;
        }

        .admin-cell-index {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-align: center;
          width: 56px;
        }

        .admin-room-title {
          font-weight: 700;
          color: #0f172a;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-desc {
          max-width: 260px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #475569;
        }

        .admin-price {
          color: #1d4ed8;
          font-weight: 700;
        }

        .admin-status {
          border-radius: 999px;
          font-size: 0.73rem;
          padding: 6px 10px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .admin-status-rent {
          background: #e0f2fe;
          color: #0c4a6e;
        }

        .admin-status-occupied {
          background: #dcfce7;
          color: #14532d;
        }

        .admin-table-btn {
          border-radius: 999px;
          padding: 5px 12px;
          font-weight: 600;
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}</style>

      <div className="container-fluid p-0 admin-dashboard-scope">
        <div className="row mb-3">
          <div className="col-auto d-none d-sm-block">
            <h3 className="admin-dashboard-title">
              <i className="bi bi-bar-chart-fill"></i>
              Thống kê
            </h3>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="card admin-metric-card">
              <div className="card-body">
                <div className="admin-metric-head">
                  <h5 className="admin-metric-label">Tài khoản</h5>
                  <i className="bi bi-people-fill admin-metric-icon"></i>
                </div>
                <h1 className="admin-metric-value">{number.numberOfAccount}</h1>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="card admin-metric-card">
              <div className="card-body">
                <div className="admin-metric-head">
                  <h5 className="admin-metric-label">Tin duyệt</h5>
                  <i className="bi bi-patch-check-fill admin-metric-icon"></i>
                </div>
                <h1 className="admin-metric-value">{number.numberOfApprove}</h1>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="card admin-metric-card">
              <div className="card-body">
                <div className="admin-metric-head">
                  <h5 className="admin-metric-label">Tin chưa duyệt</h5>
                  <i className="bi bi-hourglass-split admin-metric-icon"></i>
                </div>
                <h1 className="admin-metric-value">{number.numberOfApproving}</h1>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="card admin-metric-card">
              <div className="card-body">
                <div className="admin-metric-head">
                  <h5 className="admin-metric-label">Tổng tin</h5>
                  <i className="bi bi-files admin-metric-icon"></i>
                </div>
                <h1 className="admin-metric-value">{number.numberOfAccountLocked}</h1>
              </div>
            </div>
          </div>
        </div>

        {role === "ROLE_ADMIN" && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card admin-liveness-card">
                <div className="card-body py-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle text-white p-2 me-3"
                        style={{
                          width: "44px",
                          height: "44px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                        }}
                      >
                        <i className="bi bi-shield-lock-fill"></i>
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold text-dark">Cấu hình Face ID Liveness</h5>
                        <small className="text-muted">Chế độ chớp mắt bảo mật (Active Liveness)</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span
                        className={`me-3 badge admin-status-chip ${enableLiveness ? "bg-success" : "bg-secondary"}`}
                      >
                        {enableLiveness ? "ĐANG BẬT" : "ĐANG TẮT"}
                      </span>
                      <div className="form-check form-switch mb-0" style={{ transform: "scale(1.15)" }}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="livenessToggle"
                          checked={enableLiveness}
                          onChange={handleToggleLiveness}
                          role="switch"
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card admin-panel-card">
          <div className="card-header">
            <h5 className="card-title">Bài đăng và phòng trọ chưa duyệt</h5>
            <h6 className="card-subtitle">
              Quản lý thật tốt các chức năng của phòng trọ và bài đăng.
            </h6>
          </div>
          <div className="card-body">
            <div className="admin-table-shell">
              <div className="admin-table-toolbar">
                <div className="admin-table-toolbar-title">
                  <i className="bi bi-table"></i>
                  Danh sách cần xử lý
                </div>
                <span className="admin-count-pill">{totalItems} bản ghi</span>
              </div>
              <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer">
                <div className="row">
                  <div className="col-sm-12 col-md-6">
                    <div className="dt-buttons btn-group flex-wrap"></div>
                  </div>
                  <div className="col-sm-12 col-md-6">
                    <div id="datatables-buttons_filter" className="dataTables_filter"></div>
                  </div>
                </div>
                <div className="row dt-row">
                  <div className="col-sm-12">
                    <div className="admin-table-wrap">
                      <table
                        id="datatables-buttons"
                        className="table dataTable no-footer dtr-inline admin-table"
                        style={{ width: "100%" }}
                        aria-describedby="datatables-buttons_info"
                      >
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Tên phòng</th>
                            <th>Mô tả</th>
                            <th>Địa chỉ</th>
                            <th>Giá</th>
                            <th>Trạng thái</th>
                            <th>Phê duyệt</th>
                            <th>Gỡ tin</th>
                            <th>Tác vụ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((item, index) => (
                            <tr className="odd" key={item.id}>
                              <td className="admin-cell-index">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td>
                                <div className="admin-room-title" title={item.title}>{item.title}</div>
                              </td>
                              <td>
                                <div className="admin-desc" title={item.description}>
                                  {item.description}
                                </div>
                              </td>
                              <td>{item.location.cityName}</td>
                              <td className="admin-price">
                                {formatVnd(item.price)}
                              </td>
                              <td>
                                <span
                                  className={`badge admin-status ${
                                    item.status === "ROOM_RENT" || item.status === "CHECKED_OUT"
                                      ? "admin-status-rent"
                                      : "admin-status-occupied"
                                  }`}
                                >
                                  {item.status === "ROOM_RENT" || item.status === "CHECKED_OUT"
                                    ? "Chưa thuê"
                                    : "Đã thuê"}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm admin-table-btn"
                                  onClick={() => handleIsApprove(item.id)}
                                >
                                  {item.isApprove === false ? "Duyệt" : "Đã duyệt"}
                                </button>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm admin-table-btn"
                                  onClick={() => handleIsRemove(item.id)}
                                >
                                  {item.isRemove === false ? "Gỡ" : "Đã gỡ"}
                                </button>
                              </td>
                              <td>
                                <div className="admin-actions">
                                  <a
                                    href="#"
                                    className="admin-action-btn email"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSendEmail(item.user.id);
                                    }}
                                    data-toggle="tooltip"
                                    data-placement="bottom"
                                    title="Gửi email"
                                  >
                                    <i className="bi bi-envelope-fill"></i>
                                  </a>
                                  <a
                                    className="admin-action-btn detail"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSetRoomId(item.id);
                                    }}
                                    title="Xem chi tiết"
                                  >
                                    <i className="bi bi-info-circle-fill"></i>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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
        {showModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.55)", zIndex: 1055 }}
            onClick={handleCloseModal}
          >
            <div
              className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom bg-light py-3">
                  <h5 className="modal-title fw-bold mb-0">Chi tiết phòng trọ</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body p-3 p-md-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                  <ModalRoomDetails roomId={roomId} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardAdmin;
