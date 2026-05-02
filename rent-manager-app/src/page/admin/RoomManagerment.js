import React, { useEffect, useState, useCallback } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import {
  approveRoomOfAdmin,
  disableRoom,
  getAllRoomOfAdmin,
  removeRoomOfAdmin,
} from "../../services/fetch/ApiUtils";
import ModalRoomDetails from "./modal/ModalRoomDetail";
import useAutoReload from "../../hooks/useAutoReload";
import { formatVnd } from "../../utils/currency";

function RoomManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [roomId, setRoomId] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(() => {
    getAllRoomOfAdmin(currentPage, itemsPerPage, searchQuery)
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
    }, [currentPage, itemsPerPage, searchQuery]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    useAutoReload({ enabled: authenticated, onReload: fetchData });

    const notifyDataUpdated = () => {
      localStorage.setItem("app-data-updated-at", String(Date.now()));
      window.dispatchEvent(new Event("app-data-updated"));
    };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSetRoomId = (id) => {
    setRoomId(id);
    setShowModal(true);
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

  console.log("ROOMID", roomId);

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

        .admin-room-scope,
        .admin-room-scope * {
          font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif;
        }

        .admin-room-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
        }

        .admin-room-card .card-header {
          background: transparent;
          border-bottom: 1px solid #eef2f7;
          padding: 18px 22px;
        }

        .admin-room-card .card-title {
          margin: 0;
          font-weight: 800;
          color: #0f172a;
        }

        .admin-room-card .card-subtitle {
          margin-top: 6px;
          color: #64748b;
        }

        .admin-room-shell {
          border: 1px solid #dbeafe;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.08);
          overflow: hidden;
        }

        .admin-room-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
        }

        .admin-room-toolbar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e3a8a;
          font-weight: 700;
        }

        .admin-room-count-pill {
          background: #1d4ed8;
          color: #fff;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
        }

        .admin-room-controls {
          margin: 14px 0;
          display: flex;
          justify-content: flex-start;
        }

        .admin-search-wrap {
          min-width: 290px;
          max-width: 360px;
        }

        .admin-search-icon {
          position: relative;
        }

        .admin-search-icon i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .admin-search-wrap .form-control {
          border-radius: 999px;
          border: 1px solid #cbd5e1;
          padding-left: 34px;
          font-size: 0.84rem;
          background: #fff;
        }

        .admin-room-table-wrap {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow-x: auto;
          background: #fff;
        }

        .admin-room-table {
          margin-bottom: 0;
          min-width: 920px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-room-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #eef3f9;
          color: #334155;
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.45px;
          font-weight: 900;
          text-align: center;
          vertical-align: middle;
          border-color: #dbe4ef;
          padding: 9px 8px;
          white-space: nowrap;
          font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
        }

        .admin-room-table tbody td {
          border-color: #eef2f7;
          vertical-align: middle;
          padding: 8px 8px;
          background: #fff;
          font-size: 0.85rem;
        }

        .admin-room-table tbody tr:nth-child(even) td {
          background: #fcfdff;
        }

        .admin-room-table tbody tr:hover td {
          background: #eff6ff;
          transition: background-color 0.2s ease;
        }

        .admin-room-table th:nth-child(1),
        .admin-room-table td:nth-child(1) {
          width: 180px;
          max-width: 180px;
        }

        .admin-room-table th:nth-child(2),
        .admin-room-table td:nth-child(2) {
          width: 220px;
          max-width: 220px;
        }

        .admin-room-table th:nth-child(3),
        .admin-room-table td:nth-child(3) {
          width: 170px;
          max-width: 170px;
        }

        .admin-room-table th:nth-child(4),
        .admin-room-table td:nth-child(4) {
          width: 120px;
          max-width: 120px;
          text-align: right;
        }

        .admin-room-table th:nth-child(5),
        .admin-room-table td:nth-child(5),
        .admin-room-table th:nth-child(6),
        .admin-room-table td:nth-child(6),
        .admin-room-table th:nth-child(7),
        .admin-room-table td:nth-child(7),
        .admin-room-table th:nth-child(8),
        .admin-room-table td:nth-child(8) {
          width: 110px;
          max-width: 110px;
          text-align: center;
        }

        .admin-room-title {
          font-weight: 700;
          color: #0f172a;
          max-width: 170px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-room-desc {
          max-width: 210px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #475569;
        }

        .admin-room-price {
          color: #1d4ed8;
          font-weight: 700;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .admin-status-badge {
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.73rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          display: inline-block;
        }

        .admin-status-empty {
          background: #dcfce7;
          color: #166534;
        }

        .admin-status-partial {
          background: #fef3c7;
          color: #92400e;
        }

        .admin-status-full {
          background: #fee2e2;
          color: #991b1b;
        }

        .admin-status-maintenance {
          background: #e5e7eb;
          color: #374151;
        }

        .admin-table-btn {
          border-radius: 999px;
          padding: 4px 9px;
          font-weight: 700;
          font-size: 0.73rem;
          white-space: nowrap;
        }

        .admin-action-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .admin-action-btn {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .admin-action-btn.email {
          color: #2563eb;
        }

        .admin-action-btn.email:hover {
          background: #eff6ff;
          color: #1d4ed8;
          transform: translateY(-1px);
          border-color: #bfdbfe;
        }

        .admin-action-btn.detail {
          color: #0f766e;
        }

        .admin-action-btn.detail:hover {
          background: #ecfeff;
          color: #0f766e;
          transform: translateY(-1px);
          border-color: #99f6e4;
        }

        .admin-room-modal .modal-content {
          border: 1px solid #dbeafe;
          border-radius: 14px;
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.16);
        }

        .admin-room-modal .modal-header {
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
        }

        .admin-room-modal .modal-title {
          font-weight: 800;
          color: #1e3a8a;
        }
      `}</style>

      <div className="container-fluid p-0 admin-room-scope">
        <div className="card admin-room-card">
          <div className="card-header">
            <h5 className="card-title">Quản lý phòng và bài đăng</h5>
            <h6 className="card-subtitle text-muted">
              Quản lý thật tốt các chức năng của phòng ktx.
            </h6>
          </div>
          <div className="card-body">
            <div className="admin-room-shell">
              <div className="admin-room-toolbar">
                <div className="admin-room-toolbar-title">
                  <i className="bi bi-house-door-fill"></i>
                  Danh sách phòng và bài đăng
                </div>
                <span className="admin-room-count-pill">{totalItems} bản ghi</span>
              </div>

              <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer p-3">
                <div className="admin-room-controls">
                  <div className="admin-search-wrap">
                    <div className="admin-search-icon">
                      <i className="bi bi-search"></i>
                      <input
                        type="search"
                        className="form-control form-control-sm"
                        placeholder="Tìm theo tên phòng, mô tả, địa chỉ..."
                        aria-controls="datatables-buttons"
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </div>

                <div className="row dt-row">
                  <div className="col-sm-12">
                    <div className="admin-room-table-wrap">
                      <table
                        id="datatables-buttons"
                        className="table dataTable no-footer dtr-inline admin-room-table"
                        style={{ width: "100%" }}
                        aria-describedby="datatables-buttons_info"
                      >
                        <thead>
                          <tr>
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
                          {tableData.map((item) => (
                            <tr className="odd" key={item.id}>
                              <td>
                                <div className="admin-room-title" title={item.title}>{item.title}</div>
                              </td>
                              <td>
                                <div className="admin-room-desc" title={item.description}>{item.description}</div>
                              </td>
                              <td>{item.address}</td>
                              <td className="admin-room-price">
                                {formatVnd(item.price)}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                {item.status === "AVAILABLE" && (
                                  <span className="admin-status-badge admin-status-empty">Trống</span>
                                )}
                                {item.status === "PARTIALLY_FILLED" && (
                                  <span className="admin-status-badge admin-status-partial">Còn chỗ</span>
                                )}
                                {item.status === "FULL" && (
                                  <span className="admin-status-badge admin-status-full">Hết chỗ</span>
                                )}
                                {item.status === "MAINTENANCE" && (
                                  <span className="admin-status-badge admin-status-maintenance">Bảo trì</span>
                                )}
                                {item.status === "ROOM_RENT" && (
                                  <span className="admin-status-badge admin-status-partial">Còn chỗ</span>
                                )}
                                {item.status === "HIRED" && (
                                  <span className="admin-status-badge admin-status-full">Hết chỗ</span>
                                )}
                                {item.status === "CHECKED_OUT" && (
                                  <span className="admin-status-badge admin-status-maintenance">Bảo trì</span>
                                )}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm admin-table-btn"
                                  onClick={() => handleIsApprove(item.id)}
                                >
                                  {item.isApprove === false ? "Duyệt" : "Đã duyệt"}
                                </button>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm admin-table-btn"
                                  onClick={() => handleIsRemove(item.id)}
                                >
                                  {item.isRemove === false ? "Gỡ" : "Đã gỡ"}
                                </button>
                              </td>
                              <td>
                                <div className="admin-action-group">
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
                                    onClick={() => handleSetRoomId(item.id)}
                                    data-bs-toggle="modal"
                                    data-bs-target=".bd-example-modal-lg"
                                    data-toggle="tooltip"
                                    data-placement="bottom"
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

        <div
          className="modal fade bd-example-modal-lg admin-room-modal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Chi tiết bài đăng tin
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body overflow-auto">
                {showModal && <ModalRoomDetails roomId={roomId} />}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoomManagement;
