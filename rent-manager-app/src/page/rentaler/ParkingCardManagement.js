import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
import { getAllParkingCards, updateParkingCardStatus } from "../../services/fetch/ApiUtils";

const ParkingCardManagement = (props) => {
    const { authenticated, location } = props;
    const history = useNavigate();

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageModalTitle, setImageModalTitle] = useState("");

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        if (authenticated) {
            fetchData();
        }
    }, [currentPage, searchQuery, authenticated]);

    const fetchData = () => {
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

    const handleUpdateStatus = (id, status) => {
        if (status === "REJECTED") {
            const reason = window.prompt("Nhập lý do từ chối (nếu có):");
            if (reason === null) return;
            updateParkingCardStatus(id, { status, rejectedReason: reason })
                .then(() => {
                    toast.success("Đã từ chối thẻ xe.");
                    fetchData();
                })
                .catch((error) => toast.error(error.message || "Lỗi khi từ chối."));
        } else {
            updateParkingCardStatus(id, { status })
                .then(() => {
                    toast.success("Đã duyệt! Chờ người thuê thanh toán.");
                    fetchData();
                })
                .catch((error) => toast.error(error.message || "Lỗi khi duyệt."));
        }
    };

    const openImagesModal = (images, title) => {
        if (!images || images.length === 0) {
            toast.info("Người dùng không tải lên ảnh này.");
            return;
        }
        //Ép kiểu về mảng để xử lý chung
        setSelectedImages(Array.isArray(images) ? images : [images]);
        setCurrentImageIndex(0);
        setImageModalTitle(title);
        setShowImageModal(true);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
    };

    const openInvoiceModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceModal(true);
    };

    if (!authenticated) {
        return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
    }

    const getCardStatusBadge = (status) => {
        switch (status) {
            case "PENDING": return <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-hourglass-split me-1"></i>Chờ duyệt</span>;
            case "APPROVED_WAITING_PAYMENT": return <span className="badge bg-info text-dark rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-wallet2 me-1"></i>Chờ thanh toán</span>;
            case "ACTIVE": return <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-check-circle-fill me-1"></i>Đang hoạt động</span>;
            case "REJECTED": return <span className="badge bg-danger text-white rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-x-circle-fill me-1"></i>Đã từ chối</span>;
            case "EXPIRED": return <span className="badge bg-secondary text-white rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-clock-history me-1"></i>Đã hết hạn</span>;
            default: return <span className="badge bg-secondary rounded-pill px-3 py-2 shadow-sm">{status}</span>;
        }
    };

    const getInvoiceStatusBadge = (invoiceStatus) => {
        if (!invoiceStatus) return <span className="badge bg-light text-muted border px-2 py-1"><small>Chưa có HĐ</small></span>;
        switch (invoiceStatus) {
            case "PAID": return <span className="text-success fw-bold d-flex align-items-center"><FiCheck className="me-1 fs-5"/> Đã thu</span>;
            case "PENDING": return <span className="text-warning fw-bold d-flex align-items-center"><i className="bi bi-clock me-1"></i> Chờ đóng tiền</span>;
            case "FAILED": return <span className="text-danger fw-bold d-flex align-items-center"><FiX className="me-1 fs-5"/> Thất bại</span>;
            case "CANCELLED": return <span className="text-secondary fw-bold d-flex align-items-center"><i className="bi bi-slash-circle me-1"></i> Đã hủy</span>;
            default: return <span className="text-muted fw-bold">{invoiceStatus}</span>;
        }
    };

    return (
        <>
            <style>{`
                .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .text-emerald { color: #10B981 !important; }
                .bg-emerald { background-color: #10B981 !important; color: white !important; }
                
                .modern-input { border-radius: 50px; padding: 10px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 0.95rem; }
                .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
                
                .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.9rem; padding: 8px 20px; }
                .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                
                .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
                .eco-table { margin-bottom: 0; width: 100%; min-width: 1100px; }
                .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
                .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; padding: 16px 20px; border: none; white-space: nowrap; vertical-align: middle; }
                .eco-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.95rem; white-space: nowrap; }
                .eco-table tbody tr { transition: all 0.2s ease; }
                .eco-table tbody tr:hover { background-color: #F0FDF4; }

                .btn-action-table { transition: all 0.2s; font-size: 0.85rem; padding: 6px 12px; }
                .btn-action-table:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                
                .modal-eco .modal-content { border-radius: 20px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .modal-eco .modal-header { background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; padding: 20px 24px; }
                .modal-eco .modal-footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                
                {/* Header */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-8 mb-3 mb-md-0">
                        <h2 className="fw-bolder text-dark mb-1">Quản lý Thẻ xe</h2>
                        <p className="text-muted mb-0">Duyệt đăng ký gửi xe, kiểm tra giấy tờ và theo dõi tình trạng thu phí.</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <button className="btn bg-emerald text-white btn-modern shadow-sm" onClick={() => history("/rentaler/parking-package-management")}>
                            <i className="bi bi-tags-fill me-2"></i> Quản lý Gói cước
                        </button>
                    </div>
                </div>

                {/* Tìm kiếm */}
                <div className="row mb-4">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="position-relative shadow-sm rounded-pill">
                            <input
                                type="search"
                                className="form-control modern-input w-100 pe-5"
                                placeholder="Tìm biển số hoặc tên..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted" style={{fontSize: "1.1rem"}}></i>
                        </div>
                    </div>
                </div>

                {/* Bảng Dữ Liệu */}
                <div className="modern-table-wrapper mb-4">
                    <table className="table table-hover eco-table">
                        <thead>
                            <tr>
                                <th className="ps-4">Người thuê</th>
                                <th>Thông tin xe</th>
                                <th>Gói cước</th>
                                <th>Thời gian</th>
                                <th>Trạng thái Thẻ</th>
                                <th>Thanh toán</th>
                                <th className="text-center">Giấy tờ</th>
                                <th className="text-center pe-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-credit-card-2-front fs-1 d-block mb-3 opacity-50" style={{fontSize: "2.5rem"}}></i>
                                            <span style={{fontSize: "1rem"}}>Không có dữ liệu thẻ xe.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tableData.map((item) => (
                                    <tr key={item.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark d-flex align-items-center">
                                                <i className="bi bi-person-circle text-emerald me-2 fs-5"></i>
                                                {item.user?.name}
                                            </div>
                                            <small className="text-muted ms-4 ps-1">
                                                <i className="bi bi-telephone-fill me-1"></i> {item.user?.phone}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="badge bg-dark fs-6 rounded-pill px-3 shadow-sm mb-1">{item.licensePlate}</span><br />
                                            <span className="text-muted fw-medium d-inline-flex align-items-center">
                                                <span className="me-1 fs-5">{item.vehicleType === 'CAR' ? '🚗' : '🏍️'}</span> 
                                                {item.brandModel} - {item.color}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{item.packageInfo?.name || "Gói gửi xe"}</div>
                                            <div className="text-danger fw-bold my-1">
                                                {item.packageInfo?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || "0 ₫"}
                                            </div>
                                            <small className="badge bg-light text-primary border rounded-pill">
                                                <i className="bi bi-calendar-event me-1"></i>
                                                Hạn: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "Chưa kích hoạt"}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                                                <span className="fw-bold">Tạo:</span> {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "-"}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                <span className="fw-bold">Phát hành:</span> {item.issueDate ? new Date(item.issueDate).toLocaleDateString("vi-VN") : "-"}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                <span className="fw-bold">Cập nhật:</span> {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("vi-VN") : "-"}
                                            </div>
                                        </td>
                                        <td>{getCardStatusBadge(item.status)}</td>
                                        <td>
                                            <div className="bg-light p-2 rounded-3 border d-inline-block">
                                                {getInvoiceStatusBadge(item.invoiceStatus || item.invoices?.[0]?.status)}
                                                {(item.invoice || item.invoices?.[0]) && (
                                                    <div className="mt-2 text-center border-top pt-2">
                                                        <button
                                                            className="btn btn-sm btn-link p-0 text-decoration-none text-primary fw-bold"
                                                            onClick={() => openInvoiceModal(item.invoice || item.invoices?.[0])}
                                                        >
                                                            <i className="bi bi-receipt me-1"></i> Chi tiết HĐ
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex flex-column gap-2 align-items-center">
                                                <button
                                                    className="btn btn-outline-info bg-white shadow-sm rounded-pill btn-action-table w-100 fw-semibold"
                                                    onClick={() => openImagesModal(item.registrationImageUrl, "Giấy Tờ Đăng Ký Xe")}
                                                >
                                                    <FiEye className="me-1"/> Giấy tờ xe
                                                </button>
                                                {item.vehicleImages && item.vehicleImages.length > 0 && (
                                                    <button
                                                        className="btn btn-outline-secondary bg-white shadow-sm rounded-pill btn-action-table w-100 fw-semibold"
                                                        onClick={() => openImagesModal(item.vehicleImages, "Ảnh Thực Tế Của Xe")}
                                                    >
                                                        <FiEye className="me-1"/> Ảnh xe ({item.vehicleImages.length})
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center pe-4">
                                            {item.status === "PENDING" ? (
                                                <div className="d-flex flex-column gap-2 align-items-center">
                                                    <button
                                                        className="btn btn-success shadow-sm rounded-pill btn-action-table w-100 fw-semibold"
                                                        onClick={() => handleUpdateStatus(item.id, "APPROVED_WAITING_PAYMENT")}
                                                    >
                                                        <FiCheck className="me-1 fs-6"/> Duyệt
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger bg-white shadow-sm rounded-pill btn-action-table w-100 fw-semibold"
                                                        onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                                                    >
                                                        <FiX className="me-1 fs-6"/> Từ chối
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

                {/* Phân trang */}
                <div className="d-flex justify-content-center mt-4">
                    <Pagination
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        currentPage={currentPage}
                        paginate={paginate}
                    />
                </div>

            </div>

            {/* Modal Chi Tiết Hóa Đơn */}
            {showInvoiceModal && selectedInvoice && (
                <div className="modal fade show d-block modal-eco" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bolder text-dark d-flex align-items-center">
                                    <i className="bi bi-receipt-cutoff text-emerald me-2 fs-4"></i>
                                    Hóa đơn #{selectedInvoice.id}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="bg-light p-4 rounded-4 border">
                                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                        <span className="text-muted fw-semibold">Tổng tiền thanh toán:</span>
                                        <strong className="text-danger fs-4">
                                            {selectedInvoice.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Trạng thái giao dịch:</span>
                                        <span>{getInvoiceStatusBadge(selectedInvoice.status)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Phương thức thanh toán:</span>
                                        <strong className="text-dark">{selectedInvoice.paymentMethod || "-"}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">Mã giao dịch cổng (VNPAY):</span>
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
                            <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                                <button type="button" className="btn btn-secondary w-100 rounded-pill fw-bold py-2" onClick={() => setShowInvoiceModal(false)}>
                                    Đóng cửa sổ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Ảnh */}
            {showImageModal && selectedImages.length > 0 && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content bg-transparent border-0">
                            <div className="modal-header border-0 pb-0 justify-content-center position-relative">
                                <h4 className="modal-title text-white fw-bold">{imageModalTitle}</h4>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white position-absolute end-0 bg-white rounded-circle p-2 opacity-75" 
                                    style={{ top: '15px', right: '15px' }} 
                                    onClick={() => setShowImageModal(false)}
                                    title="Đóng"
                                ></button>
                            </div>
                            
                            <div className="modal-body text-center position-relative d-flex align-items-center justify-content-center" style={{ minHeight: "65vh" }}>
                                {selectedImages.length > 1 && (
                                    <button 
                                        className="btn btn-light rounded-circle position-absolute start-0 ms-2 ms-md-4 shadow-lg fs-4 d-flex align-items-center justify-content-center" 
                                        onClick={handlePrevImage} 
                                        style={{ zIndex: 10, width: '50px', height: '50px' }}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                )}
                                
                                <img
                                    src={selectedImages[currentImageIndex]?.startsWith("http") 
                                            ? selectedImages[currentImageIndex] 
                                            : `http://localhost:8080/image/${selectedImages[currentImageIndex]}`}
                                    alt="Ảnh xe/Giấy tờ"
                                    className="img-fluid rounded-4 shadow-lg border border-3 border-secondary"
                                    style={{ maxHeight: "75vh", objectFit: "contain", transition: "all 0.3s ease" }}
                                />
                                
                                {selectedImages.length > 1 && (
                                    <button 
                                        className="btn btn-light rounded-circle position-absolute end-0 me-2 me-md-4 shadow-lg fs-4 d-flex align-items-center justify-content-center" 
                                        onClick={handleNextImage} 
                                        style={{ zIndex: 10, width: '50px', height: '50px' }}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                            
                            {selectedImages.length > 1 && (
                                <div className="text-center text-white pb-4 fs-5 mt-2">
                                    <span className="badge bg-dark rounded-pill px-4 py-2 border border-secondary shadow">
                                        Ảnh {currentImageIndex + 1} / {selectedImages.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ParkingCardManagement;