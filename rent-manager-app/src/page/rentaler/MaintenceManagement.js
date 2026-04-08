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
        return <span className="badge bg-emerald text-white rounded-pill px-3 py-2 shadow-sm">Đã hoàn thành</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-info text-white rounded-pill px-3 py-2 shadow-sm">Đang thực hiện</span>;
      default:
        return <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm">Chờ duyệt</span>;
    }
  };

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-input { border-radius: 50px; padding: 10px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; }
        .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        
        .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.9rem; padding: 8px 20px; }
        .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        /* Table Styles */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #f1f5f9; }
        .eco-table { margin-bottom: 0; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; padding: 16px 20px; border: none; }
        .eco-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.95rem; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }
        
        /* Nút trong bảng */
        .btn-table-action { width: 34px; height: 34px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; }
        .btn-table-action:hover:not(:disabled) { transform: translateY(-2px); }

        /* Modal Style */
        .modern-modal-content { border-radius: 20px; border: none; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .modern-modal-input { border-radius: 10px; border: 1px solid #E2E8F0; padding: 10px 15px; }
        .modern-modal-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); outline: none; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        <div className="row mb-4 align-items-center">
          <div className="col-md-8">
            <h2 className="fw-bolder text-dark mb-1">Quản lý bảo trì</h2>
            <p className="text-muted mb-0">Theo dõi và xử lý các yêu cầu sửa chữa, bảo trì phòng trọ dưới dạng danh sách.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button className="btn bg-emerald text-white btn-modern shadow-sm" onClick={handleRedirectAddMaintenance}>
              <i className="bi bi-plus-circle me-2"></i> Thêm Phiếu Bảo Trì
            </button>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="position-relative shadow-sm rounded-pill">
              <input
                type="text"
                className="form-control modern-input w-100 pe-5"
                placeholder="Tìm kiếm theo tên phòng..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted"></i>
            </div>
          </div>
        </div>

        <div className="modern-table-wrapper mb-4">
          <div className="table-responsive">
            <table className="table table-hover eco-table">
              <thead>
                <tr>
                  <th className="ps-4">Phòng</th>
                  <th>Người báo / Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Chi phí</th>
                  <th>Thời gian</th>
                  <th>Hóa đơn</th>
                  <th className="text-end pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inboxes fs-1 d-block mb-2 opacity-50"></i>
                        Không có dữ liệu bảo trì nào.
                      </div>
                    </td>
                  </tr>
                ) : (
                  tableData.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{item.room.title}</div>
                        <div className="text-muted small"><i className="bi bi-geo-alt-fill text-emerald me-1"></i>{item.room.location.cityName}</div>
                      </td>

                      <td>
                        {item.reportedBy ? (
                          <span className="badge bg-light text-primary border border-primary rounded-pill mb-1">
                            <i className="bi bi-person-fill me-1"></i> {item.reportedBy.name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-emerald border border-success rounded-pill mb-1">
                            <i className="bi bi-shield-lock-fill me-1"></i> Chủ trọ tạo
                          </span>
                        )}
                        <div className="small text-truncate" style={{ maxWidth: "250px" }} title={item.description || "N/A"}>
                          {item.description || "N/A"}
                        </div>
                      </td>

                      <td>{getStatusBadge(item.status)}</td>

                      <td className="fw-semibold text-dark">
                        {item.price
                          ? item.price.toLocaleString("vi-VN") + " đ"
                          : "-"}
                      </td>

                      <td>
                        {item.maintenanceDate
                          ? new Date(item.maintenanceDate).toLocaleDateString("vi-VN")
                          : item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                      </td>

                      <td>
                        {item.files ? (
                          <a
                            href={
                              item.files.startsWith("http")
                                ? item.files
                                : `http://localhost:8080/document/` + item.files.replace("photographer/files/", "")
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-light text-info border shadow-sm rounded-pill px-3 py-1 fw-semibold"
                          >
                            <FiExternalLink className="me-1" /> Xem file
                          </a>
                        ) : (
                          <span className="text-muted small font-italic">-</span>
                        )}
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          {item.status === "PENDING" && (
                            <button
                              className="btn btn-light text-success border btn-table-action"
                              onClick={() => handleStatusUpdate(item.id, "IN_PROGRESS")}
                              title="Duyệt yêu cầu"
                            >
                              <FiCheck />
                            </button>
                          )}
                          {item.status === "IN_PROGRESS" && (
                            <button
                              className="btn bg-emerald text-white btn-table-action shadow-sm"
                              onClick={() => openResolveModal(item)}
                              title="Hoàn tất bảo trì"
                            >
                              <FiTool />
                            </button>
                          )}
                          <button
                            className="btn btn-light border btn-table-action"
                            onClick={() => handleEditMaintenance(item.id)}
                            title="Sửa"
                            disabled={item.status === "RESOLVED"}
                          >
                            <FiEdit2 className={item.status === "RESOLVED" ? "text-muted" : "text-primary"} />
                          </button>
                          <button
                            className="btn btn-light border btn-table-action"
                            onClick={() => handleDeleteMaintenance(item.id)}
                            title="Xóa"
                            disabled={item.status === "RESOLVED"}
                          >
                            <FiTrash2 className={item.status === "RESOLVED" ? "text-muted" : "text-danger"} />
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

        <div className="d-flex justify-content-center">
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            currentPage={currentPage}
            paginate={paginate}
          />
        </div>
      </div>

      {showResolveModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modern-modal-content">
              <div className="modal-header border-bottom-0 pt-4 px-4 pb-0">
                <h5 className="modal-title fw-bold text-dark fs-4">
                  <FiTool className="text-emerald me-2 mb-1" />
                  Báo cáo hoàn tất
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowResolveModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-4">Cập nhật chi phí thực tế và hóa đơn chứng từ để hoàn tất quy trình bảo trì.</p>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark small">Chi phí thực tế (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control modern-modal-input w-100"
                    placeholder="VD: 500000"
                    value={resolveData.price}
                    onChange={(e) => setResolveData({ ...resolveData, price: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark small">Ngày thực hiện xong</label>
                  <input
                    type="date"
                    className="form-control modern-modal-input w-100"
                    value={resolveData.maintenanceDate}
                    onChange={(e) => setResolveData({ ...resolveData, maintenanceDate: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark small">Hóa đơn / Ảnh nghiệm thu (Tùy chọn)</label>
                  <input
                    type="file"
                    className="form-control modern-modal-input w-100 bg-light"
                    onChange={(e) => setResolveData({ ...resolveData, files: [...e.target.files] })}
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                <button
                  type="button"
                  className="btn btn-light btn-modern text-muted fw-bold px-4"
                  onClick={() => setShowResolveModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn bg-emerald text-white btn-modern fw-bold px-4 shadow-sm"
                  onClick={() => handleStatusUpdate(resolveData.id, "RESOLVED", resolveData)}
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