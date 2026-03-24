import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
import { getAllParkingCards, updateParkingCardStatus } from "../../services/fetch/ApiUtils";

const ParkingManagement = (props) => {
    const { authenticated, location } = props;
    const history = useNavigate();

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

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

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
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
                                <h5 className="card-title">Quản lý Thẻ xe</h5>
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
                                                            <strong>{item.user?.name}</strong><br />
                                                            <small className="text-muted">{item.user?.phone}</small>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-dark fs-6">{item.licensePlate}</span><br />
                                                            <small className="text-muted">
                                                                {item.vehicleType === 'CAR' ? '🚗' : '🏍️'} {item.brandModel} - {item.color}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <strong>{item.packageInfo?.name || "Gói gửi xe"}</strong><br />
                                                            <span className="text-danger">
                                                                {item.packageInfo?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || "0 ₫"}
                                                            </span>
                                                        </td>
                                                        <td>{getCardStatusBadge(item.status)}</td>
                                                        <td>
                                                            {getInvoiceStatusBadge(item.invoiceStatus || item.invoices?.[0]?.status)}
                                                            <br />
                                                            {(item.invoice || item.invoices?.[0]) && (
                                                                <button
                                                                    className="btn btn-sm btn-link p-0 text-decoration-none mt-1"
                                                                    onClick={() => openInvoiceModal(item.invoice || item.invoices?.[0])}
                                                                >
                                                                    <small>Chi tiết hóa đơn</small>
                                                                </button>
                                                            )}
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

            {showInvoiceModal && selectedInvoice && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title text-primary">Chi tiết Hóa đơn #{selectedInvoice.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="card bg-light border-0">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Số tiền:</span>
                                            <strong className="text-danger fs-5">
                                                {selectedInvoice.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Trạng thái:</span>
                                            <span>{getInvoiceStatusBadge(selectedInvoice.status)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Phương thức:</span>
                                            <strong>{selectedInvoice.paymentMethod || "Tiền mặt"}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Mã giao dịch (VNPAY):</span>
                                            <span>{selectedInvoice.transactionId || "-"}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Ngày thu:</span>
                                            <span>{selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString("vi-VN") : "Chưa thanh toán"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0">
                                <button type="button" className="btn btn-secondary w-100" onClick={() => setShowInvoiceModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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