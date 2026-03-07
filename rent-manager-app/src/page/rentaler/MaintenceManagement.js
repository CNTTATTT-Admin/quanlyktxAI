import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  deleteMaintenance,
  getAllMaintenceOfRentaler,
  updateMaintenanceStatus,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiTool,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";

function MaintenceManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveData, setResolveData] = useState({
    id: "",
    price: "",
    maintenanceDate: "",
    files: [],
  });

  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const fetchData = () => {
    getAllMaintenceOfRentaler(currentPage, itemsPerPage, searchQuery)
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
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRedirectAddMaintenance = () => {
    history("/rentaler/add-maintenance");
  };

  const handleEditMaintenance = (id) => {
    history("/rentaler/edit-maintenance/" + id);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteMaintenance = (id) => {
    deleteMaintenance(id)
      .then((response) => {
        toast.success("Xóa phiếu bảo trì thành công");
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleStatusUpdate = (id, status, extraData = {}) => {
    updateMaintenanceStatus(id, { status, ...extraData })
      .then((response) => {
        toast.success(response.message);
        fetchData();
        setShowResolveModal(false);
      })
      .catch((error) => {
        toast.error((error && error.message) || "Cập nhật trạng thái thất bại");
      });
  };

  const openResolveModal = (item) => {
    setResolveData({
      id: item.id,
      price: item.price || "",
      maintenanceDate: item.maintenanceDate
        ? item.maintenanceDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      files: [],
    });
    setShowResolveModal(true);
  };

  if (!props.authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-rentaler",
          state: { from: location },
        }}
      />
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return <span className="badge bg-success">Đã hoàn thành</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-primary">Đang thực hiện</span>;
      default:
        return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
    }
  };

  return (
    <>
      <div className="wrapper">
        <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <a className="sidebar-brand" href="index.html">
              <span className="align-middle">RENTALER PRO</span>
            </a>
            <SidebarNav />
          </div>
        </nav>

        <div className="main">
          <Nav onLogout={onLogout} currentUser={currentUser} />

          <br />
          <div className="container-fluid p-0"></div>
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">Quản lý bảo trì</h5>
                  <h6 className="card-subtitle text-muted">
                    {" "}
                    Quản lý bảo trì của phòng trọ.
                  </h6>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleRedirectAddMaintenance}
                >
                  Thêm Phiếu Bảo Trì
                </button>
              </div>
            </div>
            <div className="card-body">
              <div
                id="datatables-buttons_wrapper"
                className="dataTables_wrapper dt-bootstrap5 no-footer"
              >
                <div className="row">
                  <div className="col-sm-12 col-md-6"></div>
                  <div className="col-sm-12 col-md-6">
                    <div
                      id="datatables-buttons_filter"
                      className="dataTables_filter text-end"
                    >
                      <label>
                        Tìm kiếm:
                        <input
                          type="search"
                          className="form-control form-control-sm d-inline-block w-auto ms-2"
                          placeholder="Tên phòng..."
                          value={searchQuery}
                          onChange={handleSearch}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row dt-row">
                  <div className="col-sm-12">
                    <table
                      className="table table-striped dataTable no-footer"
                      style={{ width: "100%" }}
                    >
                      <thead>
                        <tr>
                          <th>Phòng</th>
                          <th>Người báo / Mô tả</th>
                          <th>Trạng thái</th>
                          <th>Chi phí</th>
                          <th>Thời gian</th>
                          <th>Hóa đơn</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Không có dữ liệu bảo trì.
                            </td>
                          </tr>
                        ) : (
                          tableData.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.room.title}</strong>
                                <br />
                                <small className="text-muted">
                                  {item.room.address}
                                </small>
                              </td>
                              <td>
                                {item.reportedBy ? (
                                  <>
                                    <span className="badge bg-info text-dark">
                                      {item.reportedBy.name}
                                    </span>
                                    <br />
                                  </>
                                ) : (
                                  <span className="text-muted">
                                    <small>Rentaler tạo</small>
                                    <br />
                                  </span>
                                )}
                                <small>{item.description || "N/A"}</small>
                              </td>
                              <td>{getStatusBadge(item.status)}</td>
                              <td>
                                {item.price
                                  ? item.price.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })
                                  : "-"}
                              </td>
                              <td>
                                {item.maintenanceDate
                                  ? new Date(
                                      item.maintenanceDate,
                                    ).toLocaleDateString("vi-VN")
                                  : item.createdAt
                                    ? new Date(
                                        item.createdAt,
                                      ).toLocaleDateString("vi-VN")
                                    : "-"}
                              </td>
                              <td>
                                {item.files ? (
                                  <a
                                    href={
                                      item.files.startsWith("http")
                                        ? item.files
                                        : `http://localhost:8080/document/` +
                                          item.files.replace(
                                            "photographer/files/",
                                            "",
                                          )
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                                  >
                                    <FiExternalLink /> Xem
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>
                                <div className="btn-group">
                                  {item.status === "PENDING" && (
                                    <button
                                      className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          item.id,
                                          "IN_PROGRESS",
                                        )
                                      }
                                      title="Duyệt"
                                    >
                                      <FiCheck /> Duyệt
                                    </button>
                                  )}
                                  {item.status === "IN_PROGRESS" && (
                                    <button
                                      className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                      onClick={() => openResolveModal(item)}
                                      title="Hoàn tất"
                                    >
                                      <FiTool /> Hoàn tất
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-sm btn-light ms-1 d-flex align-items-center"
                                    onClick={() =>
                                      handleEditMaintenance(item.id)
                                    }
                                    title="Sửa"
                                    disabled={item.status === "RESOLVED"}
                                  >
                                    <FiEdit2
                                      className={
                                        item.status === "RESOLVED"
                                          ? "text-muted"
                                          : "text-primary"
                                      }
                                    />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-light d-flex align-items-center"
                                    onClick={() =>
                                      handleDeleteMaintenance(item.id)
                                    }
                                    title="Xóa"
                                    disabled={item.status === "RESOLVED"}
                                  >
                                    <FiTrash2
                                      className={
                                        item.status === "RESOLVED"
                                          ? "text-muted"
                                          : "text-danger"
                                      }
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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

      {/* Resolve Modal */}
      {showResolveModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hoàn tất bảo trì</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowResolveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Chi phí (VND)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={resolveData.price}
                    onChange={(e) =>
                      setResolveData({ ...resolveData, price: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày thực hiện</label>
                  <input
                    type="date"
                    className="form-control"
                    value={resolveData.maintenanceDate}
                    onChange={(e) =>
                      setResolveData({
                        ...resolveData,
                        maintenanceDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Hóa đơn / Ảnh nghiệm thu</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) =>
                      setResolveData({
                        ...resolveData,
                        files: [...e.target.files],
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResolveModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    handleStatusUpdate(resolveData.id, "RESOLVED", resolveData)
                  }
                >
                  Lưu & Hoàn tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MaintenceManagement;
