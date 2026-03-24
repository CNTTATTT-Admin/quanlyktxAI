import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
// Bạn cần thêm 2 hàm này vào ApiUtils.js sau nhé
import { getAllParkingCards, updateParkingCardStatus } from "../../services/fetch/ApiUtils";

const ParkingManagement = (props) => {
  const { authenticated, location } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // State cho Modal xem ảnh giấy tờ xe
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [currentPage, searchQuery, authenticated]);

  const fetchData = () => {
    // Gọi API lấy danh sách thẻ xe (kèm theo thông tin gói cước và hóa đơn mới nhất)
    getAllParkingCards(currentPage - 1, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content || []);
        setTotalItems(response.totalElements || 0);
      })
      .catch((error) => {
        toast.error((error && error.message) || "Không thể tải danh sách thẻ xe.");
      });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm xử lý duyệt/từ chối
  const handleUpdateStatus = (id, status) => {
    if (status === "REJECTED") {
      const reason = window.prompt("Nhập lý do từ chối (nếu có):");
      if (reason === null) return; // Hủy
      updateParkingCardStatus(id, { status, rejectedReason: reason })
        .then(() => {
          toast.success("Đã từ chối thẻ xe.");
          fetchData();
        })
        .catch((error) => toast.error(error.message || "Lỗi khi từ chối."));
    } else {
      // Khi duyệt, trạng thái thường chuyển sang APPROVED_WAITING_PAYMENT để chờ nộp tiền
      updateParkingCardStatus(id, { status })
        .then(() => {
          toast.success("Đã duyệt! Chờ người thuê thanh toán.");
          fetchData();
        })
        .catch((error) => toast.error(error.message || "Lỗi khi duyệt."));
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
  }

  const getCardStatusBadge = (status) => {
    switch (status) {
      case "PENDING": return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
      case "APPROVED_WAITING_PAYMENT": return <span className="badge bg-info text-dark">Chờ thanh toán</span>;
      case "ACTIVE": return <span className="badge bg-success">Đang hoạt động</span>;
      case "REJECTED": return <span className="badge bg-danger">Đã từ chối</span>;
      case "EXPIRED": return <span className="badge bg-secondary">Đã hết hạn</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getInvoiceStatusBadge = (invoiceStatus) => {
    if (!invoiceStatus) return <span className="text-muted"><small>Chưa có hóa đơn</small></span>;
    switch (invoiceStatus) {
      case "PAID": return <span className="text-success fw-bold"><FiCheck /> Đã thu</span>;
      case "PENDING": return <span className="text-warning fw-bold">Chờ đóng tiền</span>;
      case "FAILED": return <span className="text-danger fw-bold">Thất bại</span>;
      default: return <span className="text-muted">{invoiceStatus}</span>;
    }
  };

  return (
    <>
      <div className="container-fluid p-0">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title">Quản lý Bãi xe & Hóa đơn</h5>
                <h6 className="card-subtitle text-muted">
                  Duyệt đăng ký gửi xe và theo dõi tình trạng thu phí.
                </h6>
              </div>
              <button className="btn btn-primary" onClick={() => history("/rentaler/parking-packages")}>
                Quản lý Gói cước (Menu)
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="dataTables_wrapper dt-bootstrap5 no-footer">
              <div className="row mb-3">
                <div className="col-sm-12 col-md-6"></div>
                <div className="col-sm-12 col-md-6 text-end">
                  <label>
                    Tìm biển số / tên:
                    <input
                      type="search"
                      className="form-control form-control-sm d-inline-block w-auto ms-2"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </label>
                </div>
              </div>
              
              <div className="row dt-row">
                <div className="col-sm-12 table-responsive">
                  <table className="table table-striped dataTable no-footer" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Người thuê</th>
                        <th>Thông tin xe</th>
                        <th>Gói cước</th>
                        <th>Trạng thái Thẻ</th>
                        <th>Thanh toán</th>
                        <th className="text-center">Giấy tờ</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">Không có dữ liệu thẻ xe.</td>
                        </tr>
                      ) : (
                        tableData.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.user?.name}</strong><br/>
                              <small className="text-muted">{item.user?.phone}</small>
                            </td>
                            <td>
                              <span className="badge bg-dark fs-6">{item.licensePlate}</span><br/>
                              <small className="text-muted">
                                {item.vehicleType === 'CAR' ? '🚗' : '🏍️'} {item.brandModel} - {item.color}
                              </small>
                            </td>
                            <td>
                              <strong>{item.packageInfo?.name || "Gói gửi xe"}</strong><br/>
                              <span className="text-danger">
                                {item.packageInfo?.price?.toLocaleString('vi-VN', {style : 'currency', currency : 'VND'}) || "0 ₫"}
                              </span>
                            </td>
                            <td>{getCardStatusBadge(item.status)}</td>
                            <td>
                              {/* Giả định API trả về mảng invoices và ta lấy cái mới nhất, hoặc trả về một object invoice đi kèm */}
                              {getInvoiceStatusBadge(item.invoiceStatus || item.invoices?.[0]?.status)}
                            </td>
                            <td className="text-center">
                              <button 
                                className="btn btn-sm btn-outline-info"
                                onClick={() => openImageModal(item.registrationImageUrl)}
                                title="Xem giấy tờ"
                              >
                                <FiEye /> Xem ảnh
                              </button>
                            </td>
                            <td className="text-center">
                              {item.status === "PENDING" && (
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                    onClick={() => handleUpdateStatus(item.id, "APPROVED_WAITING_PAYMENT")}
                                  >
                                    <FiCheck /> Duyệt
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                                    onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                                  >
                                    <FiX /> Từ chối
                                  </button>
                                </div>
                              )}
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

      {/* Modal Xem Ảnh */}
      {showImageModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ảnh Giấy Tờ Đăng Ký Xe</h5>
                <button type="button" className="btn-close" onClick={() => setShowImageModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedImage?.startsWith("http") ? selectedImage : `http://localhost:8080/image/${selectedImage}`} 
                  alt="Giấy tờ xe" 
                  className="img-fluid rounded"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParkingManagement;