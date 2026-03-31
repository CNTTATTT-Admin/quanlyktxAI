import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import {
    getParkingCardsForUser,
    updateParkingCardStatus,
    createVNPayUrl,
    createRenewalInvoiceApi
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

function ParkingCardHistory(props) {
    const { authenticated, currentUser, location, onLogout } = props;

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        if (authenticated) {
            fetchData();
        }
    }, [currentPage, searchQuery, authenticated]);

    const fetchData = () => {
        getParkingCardsForUser(currentPage, itemsPerPage, searchQuery)
            .then((response) => {
                setTableData(response.content || []);
                setTotalItems(response.totalElements || 0);
            })
            .catch((error) => {
                toast.error((error && error.message) || "Lỗi khi tải lịch sử thẻ xe!");
            });
    };

    const openInvoiceModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceModal(true);
    };

    const handleCancel = (id, currentStatus) => {
        const confirmMsg = currentStatus === "ACTIVE"
            ? "Thẻ xe này ĐÃ THANH TOÁN và ĐANG HOẠT ĐỘNG. Bạn có chắc chắn muốn hủy không?"
            : "Bạn có chắc chắn muốn hủy yêu cầu đăng ký thẻ xe này?";

        if (window.confirm(confirmMsg)) {
            updateParkingCardStatus(id, { status: "CANCELLED" })
                .then((res) => {
                    toast.success("Đã hủy thẻ xe thành công!");
                    fetchData();
                })
                .catch((err) => {
                    toast.error((err && err.message) || "Hủy thất bại!");
                });
        }
    };

    const handlePayment = (invoiceId) => {
        if (!invoiceId) {
            toast.error("Không tìm thấy thông tin hóa đơn!");
            return;
        }
        createVNPayUrl(invoiceId)
            .then((res) => {
                if (res && res.url) {
                    //Sang VNPAY
                    window.location.href = res.url;
                }
            })
            .catch((err) => {
                toast.error((err && err.message) || "Không thể tạo link thanh toán!");
            });
    };

    const handleRenewCard = (parkingCardId) => {
        if (window.confirm("Hệ thống sẽ tạo một hóa đơn gia hạn mới cho thẻ xe này. Bạn có muốn tiếp tục?")) {
            createRenewalInvoiceApi(parkingCardId) 
                .then((newInvoice) => {
                    toast.success("Tạo hóa đơn gia hạn thành công! Chuyển hướng thanh toán...");
                    handlePayment(newInvoice.id); 
                })
                .catch((error) => {
                    toast.error((error && error.message) || "Không thể tạo hóa đơn gia hạn!");
                });
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderStatusBadge = (status) => {
        switch (status) {
            case "PENDING": return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
            case "APPROVED_WAITING_PAYMENT": return <span className="badge bg-info text-dark">Chờ thanh toán</span>;
            case "ACTIVE": return <span className="badge bg-success">Đang hoạt động</span>;
            case "REJECTED": return <span className="badge bg-danger">Bị từ chối</span>;
            case "CANCELLED": return <span className="badge bg-secondary">Đã hủy</span>;
            case "EXPIRED": return <span className="badge bg-dark">Hết hạn</span>;
            default: return <span className="badge bg-primary">{status}</span>;
        }
    };

    const renderInvoiceStatusBadge = (invoiceStatus) => {
        switch (invoiceStatus) {
            case "PAID": return <span className="text-success fw-bold">Đã thanh toán</span>;
            case "PENDING": return <span className="text-warning fw-bold">Chờ thanh toán</span>;
            case "FAILED": return <span className="text-danger fw-bold">Thất bại</span>;
            case "CANCELLED": return <span className="text-secondary fw-bold">Đã hủy</span>;
            default: return <span className="text-muted">{invoiceStatus || "Chưa có"}</span>;
        }
    };

    if (!authenticated) {
        return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
    }

    return (
        <>
            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            <div style={{ marginTop: "140px" }}></div>
            <main id="main">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <span className="sidebar-brand">
                                <span className="align-middle">RENTALER PRO</span>
                            </span>
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <br />
                        <div className="container-fluid p-0">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="card-title mb-0">Lịch sử đăng ký thẻ xe</h5>
                                    <h6 className="card-subtitle text-muted mt-1">
                                        Quản lý các thẻ xe bạn đã đăng ký, thanh toán hóa đơn và xem trạng thái.
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-sm-12 col-md-6"></div>
                                        <div className="col-sm-12 col-md-6 text-end">
                                            <label className="d-flex align-items-center justify-content-end">
                                                <span className="me-2 text-muted fw-bold">Tìm biển số / Gói cước:</span>
                                                <input
                                                    type="search"
                                                    className="form-control form-control-sm w-auto shadow-sm"
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Biển số xe</th>
                                                    <th>Thông tin xe</th>
                                                    <th>Gói cước</th>
                                                    <th>Ngày tạo</th>
                                                    <th>Ngày cập nhật</th>
                                                    <th>Trạng thái thẻ</th>
                                                    <th>Lý do từ chối</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center py-4 text-muted">
                                                            Bạn chưa có lịch sử đăng ký thẻ xe nào.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tableData.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="fw-bold text-primary">{item.licensePlate}</td>
                                                            <td>
                                                                <div>{item.brandModel}</div>
                                                                <small className="text-muted">Màu: {item.color} | {item.vehicleType === 'MOTORBIKE' ? 'Xe máy' : 'Ô tô'}</small>
                                                            </td>
                                                            <td>
                                                                {item.packageInfo ? (
                                                                    <>
                                                                        <div>{item.packageInfo.name}</div>
                                                                        <small className="text-success fw-bold">
                                                                            {item.packageInfo.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                                        </small><br />
                                                                        <small className="text-primary fw-bold">
                                                                            Hạn: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "Chưa kích hoạt"}
                                                                        </small>
                                                                    </>
                                                                ) : "N/A"}
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "-"}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted fw-bold">
                                                                    {item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "-"}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                {renderStatusBadge(item.status)}
                                                                <br />
                                                                {item.invoice && (
                                                                    <button
                                                                        className="btn btn-sm btn-link p-0 text-decoration-none mt-1"
                                                                        onClick={() => openInvoiceModal(item.invoice)}
                                                                    >
                                                                        <small>Chi tiết hóa đơn</small>
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td className="text-danger" style={{ maxWidth: '150px' }}>
                                                                {item.status === 'REJECTED' ? item.rejectedReason : ''}
                                                            </td>
                                                            <td>
                                                                {(item.status === "PENDING" || item.status === "APPROVED_WAITING_PAYMENT" || item.status === "ACTIVE") && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger shadow-sm me-2"
                                                                        onClick={() => handleCancel(item.id, item.status)}
                                                                    >
                                                                        {item.status === "ACTIVE" ? "Hủy thẻ xe" : "Hủy yêu cầu"}
                                                                    </button>
                                                                )}

                                                                {(item.status === "ACTIVE" || item.status === "EXPIRED") && (
                                                                    <button
                                                                        className="btn btn-sm btn-primary shadow-sm mb-1"
                                                                        onClick={() => handleRenewCard(item.id)}
                                                                    >
                                                                        Gia hạn thẻ
                                                                    </button>
                                                                )}

                                                                {item.status === "APPROVED_WAITING_PAYMENT" && (
                                                                    <button
                                                                        className="btn btn-sm btn-success shadow-sm"
                                                                        onClick={() => handlePayment(item.invoice?.id)}
                                                                    >
                                                                        <i className="align-middle me-1" data-feather="credit-card"></i>
                                                                        Thanh toán ngay
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
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
            </main>
            <Footer />
            {showInvoiceModal && selectedInvoice && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title text-primary fw-bold">Chi tiết Hóa đơn #{selectedInvoice.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="card bg-light border-0">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                            <span className="text-muted">Số tiền cần thanh toán:</span>
                                            <strong className="text-danger fs-5">
                                                {selectedInvoice.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Trạng thái:</span>
                                            <span>{renderInvoiceStatusBadge(selectedInvoice.status)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Phương thức:</span>
                                            <strong>{selectedInvoice.paymentMethod || "-"}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Mã giao dịch:</span>
                                            <span>{selectedInvoice.transactionId || "-"}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Ngày thanh toán:</span>
                                            <span>{selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString("vi-VN") : "-"}</span>
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
        </>
    );
}

export default ParkingCardHistory;