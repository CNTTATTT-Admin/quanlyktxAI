import React, { useEffect, useState, useCallback } from "react";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import {
  getAllBanners,
  deleteBanner,
  toggleBannerActive,
} from "../../services/fetch/ApiUtils";
import { API_BASE_URL } from "../../constants/Connect";
import useAutoReload from "../../hooks/useAutoReload";

function BannerManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const fetchData = useCallback(() => {
    getAllBanners(currentPage, itemsPerPage)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
        // Count active banners in the whole set if possible, or just use a dedicated API
        // For now, let's assume we can count from the current page but that's not accurate.
        // I'll add a count to the backend or just count here for simplicity if total is small.
        const count = response.content.filter((item) => item.isActive).length;
        // This count is only for current page. Ideally we need total active count.
        // I'll update the API later if needed, but for now let's just fetch all to count if total is small.
        // Actually, the requirement says "ẩn đi nếu đã đủ 5 banner", let's use totalElements for total count.
        setActiveCount(response.content.filter((item) => item.isActive).length);
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
    }, [fetchData]);

    useAutoReload({ enabled: authenticated, onReload: fetchData });

  const handleToggleActive = (id) => {
    toggleBannerActive(id)
      .then((response) => {
        toast.success(response.message);
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
      deleteBanner(id)
        .then(() => {
          toast.success("Xóa banner thành công");
          fetchData();
        })
        .catch((error) => {
          toast.error(
            (error && error.message) ||
              "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
          );
        });
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/banner-management/edit/${id}`);
  };

  const handleAddNew = () => {
    navigate("/admin/banner-management/add");
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

        .admin-banner-scope,
        .admin-banner-scope * {
          font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif;
        }

        .admin-banner-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
        }

        .admin-banner-card .card-header {
          background: transparent;
          border-bottom: 1px solid #eef2f7;
          padding: 18px 22px;
        }

        .admin-banner-card .card-title {
          margin: 0;
          font-weight: 800;
          color: #0f172a;
        }

        .admin-banner-card .card-subtitle {
          margin-top: 6px;
          color: #64748b;
        }

        .admin-banner-shell {
          border: 1px solid #dbeafe;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.08);
          overflow: hidden;
        }

        .admin-banner-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
        }

        .admin-banner-toolbar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e3a8a;
          font-weight: 700;
        }

        .admin-banner-count-pill {
          background: #1d4ed8;
          color: #fff;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
        }

        .admin-add-btn {
          border-radius: 999px;
          font-weight: 700;
          padding: 7px 14px;
          font-size: 0.82rem;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 20px rgba(37, 99, 235, 0.3);
        }

        .admin-banner-table-wrap {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow-x: auto;
          background: #fff;
        }

        .admin-banner-table {
          margin-bottom: 0;
          min-width: 930px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-banner-table thead th {
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
          padding: 10px 8px;
          white-space: nowrap;
          font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
        }

        .admin-banner-table tbody td {
          border-color: #eef2f7;
          vertical-align: middle;
          padding: 10px 8px;
          background: #fff;
          font-size: 0.84rem;
        }

        .admin-banner-table tbody tr:nth-child(even) td {
          background: #fcfdff;
        }

        .admin-banner-table tbody tr:hover td {
          background: #eff6ff;
          transition: background-color 0.2s ease;
        }

        .admin-banner-thumb {
          width: 128px;
          height: 66px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #dbeafe;
          box-shadow: 0 6px 12px rgba(30, 58, 138, 0.12);
        }

        .admin-banner-title {
          font-weight: 700;
          color: #0f172a;
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-banner-subtitle {
          color: #64748b;
          max-width: 210px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-order-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 24px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .admin-status-wrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid #dbeafe;
          background: #f8fbff;
        }

        .admin-status-text {
          font-size: 0.74rem;
          font-weight: 700;
        }

        .admin-status-text.active {
          color: #166534;
        }

        .admin-status-text.inactive {
          color: #6b7280;
        }

        .admin-action-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .admin-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .admin-action-btn.edit {
          color: #2563eb;
        }

        .admin-action-btn.edit:hover {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
          transform: translateY(-1px);
        }

        .admin-action-btn.delete {
          color: #dc2626;
        }

        .admin-action-btn.delete:hover {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="container-fluid p-0 admin-banner-scope">
        <div className="card admin-banner-card">
          <div className="card-header">
            <div className="row align-items-center g-3">
              <div className="col-sm-12 col-md-7">
                <h5 className="card-title">Quản lý banner quảng cáo</h5>
                <h6 className="card-subtitle text-muted">
                  Quản lý thật tốt các chức năng của banner.
                </h6>
              </div>
              <div className="col-sm-12 col-md-5 text-md-end">
                {totalItems < 5 && (
                  <button
                    className="btn btn-primary btn-sm admin-add-btn"
                    onClick={handleAddNew}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-plus-lg me-1"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                      />
                    </svg>
                    Thêm mới
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="admin-banner-shell">
              <div className="admin-banner-toolbar">
                <div className="admin-banner-toolbar-title">
                  <i className="bi bi-images"></i>
                  Danh sách banner
                </div>
                <span className="admin-banner-count-pill">{totalItems} banner</span>
              </div>

              <div
                id="datatables-buttons_wrapper"
                className="dataTables_wrapper dt-bootstrap5 no-footer p-3"
              >
                <div className="row dt-row">
                  <div className="col-sm-12">
                    <div className="admin-banner-table-wrap">
                      <table
                        id="datatables-buttons"
                        className="table dataTable no-footer dtr-inline admin-banner-table"
                        style={{ width: "100%" }}
                        aria-describedby="datatables-buttons_info"
                      >
                        <thead>
                          <tr>
                            <th>Ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Phụ đề</th>
                            <th>Thứ tự</th>
                            <th>Trạng thái</th>
                            <th style={{ width: "100px" }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((item) => (
                            <tr key={item.id} className="odd">
                              <td className="text-center">
                                <img
                                  src={
                                    item.imageUrl
                                      ? API_BASE_URL + "/document/" + item.imageUrl
                                      : ""
                                  }
                                  alt={item.title}
                                  className="admin-banner-thumb"
                                />
                              </td>
                              <td>
                                <div className="admin-banner-title" title={item.title}>{item.title}</div>
                              </td>
                              <td>
                                <div className="admin-banner-subtitle" title={item.subtitle}>{item.subtitle}</div>
                              </td>
                              <td className="text-center">
                                <span className="admin-order-pill">{item.orderIndex}</span>
                              </td>
                              <td className="text-center">
                                <div className="admin-status-wrap">
                                  <div className="form-check form-switch mb-0">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={item.isActive}
                                      onChange={() => handleToggleActive(item.id)}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </div>
                                  <span
                                    className={`admin-status-text ${item.isActive ? "active" : "inactive"}`}
                                  >
                                    {item.isActive ? "Hoạt động" : "Ẩn"}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="admin-action-group">
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleEdit(item.id);
                                    }}
                                    className="admin-action-btn edit"
                                    title="Chỉnh sửa"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </a>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(item.id);
                                    }}
                                    className="admin-action-btn delete"
                                    title="Xóa"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      <line x1="10" y1="11" x2="10" y2="17"></line>
                                      <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
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
      </div>
    </>
  );
}

export default BannerManagement;
