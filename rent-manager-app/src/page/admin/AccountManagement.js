import React, { useEffect, useState, useCallback } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import {
  disableRoom,
  getAllAccpuntOfAdmin,
  lockedAccount,
  unlockAccount,
  deleteMultipleAccounts,
} from "../../services/fetch/ApiUtils";
import useAutoReload from "../../hooks/useAutoReload";

function AccountManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch data from the API
  const fetchData = useCallback(() => {
    getAllAccpuntOfAdmin(currentPage, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
        setSelectedIds([]);
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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAuthorization = (userId) => {
    history("/admin/authorization/" + userId);
  };

  const handleLockedAccount = (userId, isLocked) => {
    if (isLocked) {
      unlockAccount(userId)
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
    } else {
      lockedAccount(userId)
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
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatRoles = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) return [];
    return roles
      .map((role) => role?.name || "")
      .filter(Boolean)
      .map((name) => name.replace("ROLE_", ""));
  };

  const getRoleClass = (roleName) => {
    if (roleName === "ADMIN") return "role-chip role-admin";
    if (roleName === "RENTALER") return "role-chip role-rentaler";
    if (roleName === "USER") return "role-chip role-user";
    return "role-chip role-default";
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = tableData.map((item) => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một tài khoản để xóa.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} tài khoản đã chọn không?`)) {
      deleteMultipleAccounts(selectedIds)
        .then(() => {
          toast.success("Xóa tài khoản thành công!");
          fetchData();
        })
        .catch((error) => {
          toast.error(
            (error && error.message) || "Không thể xóa tài khoản. Vui lòng thử lại!"
          );
        });
    }
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

        .admin-account-scope,
        .admin-account-scope * {
          font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif;
        }

        .admin-account-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
        }

        .admin-account-card .card-header {
          background: transparent;
          border-bottom: 1px solid #eef2f7;
          padding: 14px 18px;
        }

        .admin-account-card .card-title {
          margin: 0;
          font-weight: 800;
          font-size: 1.02rem;
          color: #0f172a;
        }

        .admin-account-card .card-subtitle {
          margin-top: 4px;
          font-size: 0.82rem;
          color: #64748b;
        }

        .admin-account-shell {
          border: 1px solid #dbeafe;
          border-radius: 14px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
          overflow: hidden;
        }

        .admin-account-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(90deg, #eff6ff 0%, #f8fbff 100%);
        }

        .admin-account-toolbar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e3a8a;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .admin-account-count-pill {
          background: #1d4ed8;
          color: #fff;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 9px;
        }

        .admin-account-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .admin-delete-btn {
          border-radius: 999px;
          font-weight: 700;
          padding: 6px 12px;
          font-size: 0.76rem;
          margin-left: auto;
        }

        .admin-search-wrap {
          min-width: 280px;
          max-width: 340px;
        }

        .admin-search-wrap .form-control {
          border-radius: 999px;
          border: 1px solid #cbd5e1;
          padding-left: 34px;
          font-size: 0.8rem;
          background: #fff;
          height: 34px;
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

        .admin-account-table-wrap {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow-x: auto;
          background: #fff;
        }

        .admin-account-table {
          margin-bottom: 0;
          min-width: 920px;
          table-layout: fixed;
        }

        .admin-account-table thead th {
          background: #f1f5f9;
          color: #334155;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 900;
          text-align: center;
          vertical-align: middle;
          border-color: #dbe4ef;
          padding: 9px 10px;
          white-space: nowrap;
          font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
        }

        .admin-account-table tbody td {
          border-color: #eef2f7;
          vertical-align: middle;
          padding: 9px 10px;
          background: #fff;
          font-size: 0.82rem;
        }

        .admin-account-table th:nth-child(1),
        .admin-account-table td:nth-child(1) {
          width: 46px;
          text-align: center;
        }

        .admin-account-table th:nth-child(4),
        .admin-account-table td:nth-child(4) {
          width: 170px;
          text-align: center;
          padding-left: 14px;
          padding-right: 14px;
        }

        .admin-account-table th:nth-child(5),
        .admin-account-table td:nth-child(5) {
          width: 150px;
          text-align: center;
          padding-left: 12px;
          padding-right: 12px;
        }

        .admin-account-table th:nth-child(6),
        .admin-account-table td:nth-child(6) {
          width: 130px;
          text-align: center;
        }

        .admin-account-table th:nth-child(7),
        .admin-account-table td:nth-child(7) {
          width: 130px;
          text-align: center;
        }

        .admin-account-table tbody tr:nth-child(even) td {
          background: #fcfdff;
        }

        .admin-account-table tbody tr:hover td {
          background: #eef6ff;
        }

        .admin-account-table tbody tr.table-active td {
          background: #dbeafe !important;
        }

        .admin-checkbox-cell {
          width: 48px;
          text-align: center;
        }

        .admin-name-cell {
          font-weight: 700;
          font-size: 0.82rem;
          color: #0f172a;
        }

        .admin-email-cell {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #334155;
        }

        .admin-phone-cell {
          color: #1e293b;
          font-weight: 600;
        }

        .role-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .role-chip {
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 0.68rem;
          font-weight: 700;
          border: 1px solid transparent;
          line-height: 1.5;
        }

        .role-admin {
          background: #fee2e2;
          border-color: #fecaca;
          color: #b91c1c;
        }

        .role-rentaler {
          background: #dcfce7;
          border-color: #bbf7d0;
          color: #15803d;
        }

        .role-user {
          background: #dbeafe;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }

        .role-default {
          background: #f1f5f9;
          border-color: #e2e8f0;
          color: #475569;
        }

        .admin-table-btn {
          border-radius: 999px;
          padding: 4px 10px;
          font-weight: 700;
          font-size: 0.72rem;
          white-space: nowrap;
        }
      `}</style>

      <div className="container-fluid p-0 admin-account-scope">
        <div className="card admin-account-card">
          <div className="card-header">
            <h5 className="card-title">Quản lý tài khoản</h5>
            <h6 className="card-subtitle text-muted">
              Quản lý tài khoản có các chức năng phân quyền và khóa tài khoản.
            </h6>
          </div>
          <div className="card-body">
            <div className="admin-account-shell">
              <div className="admin-account-toolbar">
                <div className="admin-account-toolbar-title">
                  <i className="bi bi-people-fill"></i>
                  Danh sách tài khoản
                </div>
                <span className="admin-account-count-pill">{totalItems} tài khoản</span>
              </div>

              <div id="datatables-buttons_wrapper" className="dataTables_wrapper dt-bootstrap5 no-footer p-3">
                <div className="admin-account-actions">
                  <div className="admin-search-wrap">
                    <div className="admin-search-icon">
                      <i className="bi bi-search"></i>
                      <input
                        type="search"
                        className="form-control form-control-sm"
                        placeholder="Tìm theo tên, email..."
                        aria-controls="datatables-buttons"
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-danger admin-delete-btn"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                  >
                    <i className="bi bi-trash3-fill me-1"></i>
                    Xóa đã chọn ({selectedIds.length})
                  </button>
                </div>

                <div className="row dt-row">
                  <div className="col-sm-12">
                    <div className="admin-account-table-wrap">
                      <table
                        id="datatables-buttons"
                        className="table dataTable no-footer dtr-inline admin-account-table"
                        style={{ width: "100%" }}
                        aria-describedby="datatables-buttons_info"
                      >
                        <thead>
                          <tr>
                            <th className="admin-checkbox-cell">
                              <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={selectedIds.length === tableData.length && tableData.length > 0}
                              />
                            </th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Chế độ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((item) => (
                            <tr key={item.id} className={selectedIds.includes(item.id) ? "table-active" : "odd"}>
                              <td className="admin-checkbox-cell">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(item.id)}
                                  onChange={(e) => handleSelectOne(e, item.id)}
                                />
                              </td>
                              <td className="admin-name-cell">{item.name}</td>
                              <td className="admin-email-cell" title={item.email}>{item.email}</td>
                              <td className="admin-phone-cell">{item.phone}</td>
                              <td>
                                <div className="role-cell">
                                  {(formatRoles(item.roles).length > 0 ? formatRoles(item.roles) : ["-"]).map((roleName, idx) => (
                                    <span key={`${item.id}-${roleName}-${idx}`} className={getRoleClass(roleName)}>
                                      {roleName}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm admin-table-btn"
                                  onClick={() => handleLockedAccount(item.id, item.isLocked)}
                                >
                                  {item.isLocked === true ? "Mở" : "Khóa"}
                                </button>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className="btn btn-success btn-sm admin-table-btn"
                                  onClick={() => handleAuthorization(item.id)}
                                >
                                  Phân quyền
                                </button>
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

export default AccountManagement;
