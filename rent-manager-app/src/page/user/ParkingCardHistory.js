import React, { useEffect, useState, useCallback } from "react";
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
import useAutoReload from "../../hooks/useAutoReload";
import { formatVnd } from "../../utils/currency";

function ParkingCardHistory(props) {
    // ==========================================
    // 🧠 LOGIC & API GIỮ NGUYÊN 100%
    // ==========================================
    const { authenticated, currentUser, location, onLogout } = props;

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const fetchData = useCallback(() => {
        getParkingCardsForUser(currentPage, itemsPerPage, searchQuery)
            .then((response) => {
                setTableData(response.content || []);
                setTotalItems(response.totalElements || 0);
            })
            .catch((error) => {
                toast.error((error && error.message) || "Lỗi khi tải lịch sử thẻ xe!");
            });
    }, [currentPage, itemsPerPage, searchQuery]);

    useEffect(() => {
        if (authenticated) {
            fetchData();
        }
    }, [authenticated, fetchData]);

    useAutoReload({ enabled: authenticated, onReload: fetchData });

    const notifyDataUpdated = () => {
        localStorage.setItem("app-data-updated-at", String(Date.now()));
        window.dispatchEvent(new Event("app-data-updated"));
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
                    notifyDataUpdated();
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
                    notifyDataUpdated();
                    handlePayment(newInvoice.id);
                })
                .catch((error) => {
                    toast.error((error && error.message) || "Không thể tạo hóa đơn gia hạn!");
                });
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ==========================================
    // 🎨 GIAO DIỆN MỚI (CHUẨN DASHBOARD - FIX SIDEBAR)
    // ==========================================
    const renderStatusBadge = (status) => {
        switch (status) {
            case "PENDING": return <span className="eco-badge eco-badge-warning"><i className="bi bi-hourglass-split me-1"></i> Chờ duyệt</span>;
            case "APPROVED_WAITING_PAYMENT": return <span className="eco-badge eco-badge-info"><i className="bi bi-wallet2 me-1"></i> Chờ thanh toán</span>;
            case "ACTIVE": return <span className="eco-badge eco-badge-success"><i className="bi bi-check-circle-fill me-1"></i> Đang hoạt động</span>;
            case "REJECTED": return <span className="eco-badge eco-badge-danger"><i className="bi bi-x-circle-fill me-1"></i> Bị từ chối</span>;
            case "CANCELLED": return <span className="eco-badge eco-badge-secondary"><i className="bi bi-slash-circle me-1"></i> Đã hủy</span>;
            case "EXPIRED": return <span className="eco-badge eco-badge-dark"><i className="bi bi-clock-history me-1"></i> Hết hạn</span>;
            default: return <span className="eco-badge eco-badge-info">{status}</span>;
        }
    };

    const renderInvoiceStatusBadge = (invoiceStatus) => {
        switch (invoiceStatus) {
            case "PAID": return <span className="eco-badge eco-badge-success"><i className="bi bi-check me-1"></i> Đã thanh toán</span>;
            case "PENDING": return <span className="eco-badge eco-badge-warning"><i className="bi bi-hourglass me-1"></i> Chờ thanh toán</span>;
            case "FAILED": return <span className="eco-badge eco-badge-danger"><i className="bi bi-x me-1"></i> Thất bại</span>;
            case "CANCELLED": return <span className="eco-badge eco-badge-secondary"><i className="bi bi-slash me-1"></i> Đã hủy</span>;
            default: return <span className="text-muted fw-semibold">{invoiceStatus || "Chưa có"}</span>;
        }
    };

    if (!authenticated) {
        return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
    }

    return (
        <>
            <style>{`
                .eco-page-bg {
                    background-color: #F8FAFC;
                    min-height: calc(100vh - 70px);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    display: flex;
                    flex-direction: column;
                }

                .wrapper {
                    display: flex;
                    align-items: stretch; 
                    width: 100%;
                    flex-grow: 1; 
                }
                
                #sidebar.sidebar {
                    background-color: #ffffff !important; 
                    position: relative !important; 
                    align-self: stretch !important; 
                    min-height: 100% !important; 
                    width: 260px !important;
                    min-width: 260px !important;
                    max-width: 260px !important;
                    border-right: 1px solid #EEF2FF;
                    z-index: 1000;
                    top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
                }

                .sidebar-content {
                    position: sticky !important;
                    top: 70px !important; 
                    height: calc(100vh - 70px) !important;
                    overflow-y: auto !important;
                    background-color: #ffffff !important;
                    display: flex;
                    flex-direction: column;
                }
                
                .sidebar-content::-webkit-scrollbar { width: 4px; }
                .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

                .main { flex-grow: 1; min-width: 0; }

                .eco-main-wrapper { padding: 30px; width: 100%; }

                .eco-card-table {
                    background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
                    border: 1px solid #EEF2FF; overflow: hidden;
                }

                .eco-card-header {
                    background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
                }

                .eco-title-icon { color: #4F46E5; margin-right: 10px; font-size: 1.3rem; }

                .eco-table { margin-bottom: 0; color: #1E293B; }
                .eco-table thead th {
                    background-color: #F8FAFC; color: #64748B; font-size: 0.85rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.5px; padding: 16px 20px;
                    border-bottom: 1px solid #E2E8F0; border-top: none; vertical-align: middle; white-space: nowrap;
                }
                .eco-table tbody td {
                    padding: 18px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9;
                    font-size: 0.95rem; font-weight: 500; transition: background-color 0.2s ease; white-space: nowrap;
                }
                .eco-table tbody tr:hover td { background-color: #F8FAFC; }

                .eco-search-input {
                    background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50px;
                    padding: 10px 20px 10px 40px; font-size: 0.95rem; transition: all 0.3s;
                }
                .eco-search-input:focus {
                    background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); outline: none;
                }

                .eco-badge {
                    padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700;
                    display: inline-flex; align-items: center;
                }
                .eco-badge-success { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
                .eco-badge-warning { background-color: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
                .eco-badge-danger { background-color: #FFF1F2; color: #E11D48; border: 1px solid #FECDD3; }
                .eco-badge-info { background-color: #E0E7FF; color: #4338CA; border: 1px solid #C7D2FE; }
                .eco-badge-secondary { background-color: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; }
                .eco-badge-dark { background-color: #334155; color: #ffffff; border: 1px solid #1E293B; }

                .eco-btn-action {
                    font-size: 0.85rem; font-weight: 600; padding: 6px 14px; border-radius: 8px; transition: all 0.2s ease; margin-right: 6px;
                }
                .eco-btn-danger { color: #E11D48; background-color: transparent; border: 1px solid #FECDD3; }
                .eco-btn-danger:hover { background-color: #FFF1F2; border-color: #FDA4AF; }
                .eco-btn-primary { background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: white; border: none; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.2); }
                .eco-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); color: white;}
                .eco-btn-success { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2); }
                .eco-btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); color: white;}

                .eco-modal-content { border-radius: 20px; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
                .eco-modal-header { background: #F8FAFC; border-bottom: 1px solid #EEF2FF; padding: 20px 24px; }
                .eco-modal-body { padding: 30px; }
            `}</style>

            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            <div style={{ marginTop: "90px" }}></div>

            <main id="main" className="eco-page-bg">
                <div className="wrapper">
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <SidebarNav />
                        </div>
                    </nav>

                    <div className="main">
                        <div className="eco-main-wrapper">

                            <div className="eco-card-table">
                                <div className="eco-card-header">
                                    <div>
                                        <h4 className="fw-bold text-dark mb-1">
                                            <i className="bi bi-car-front-fill eco-title-icon"></i>
                                            Lịch sử đăng ký thẻ xe
                                        </h4>
                                        <h6 className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                                            Quản lý các thẻ xe bạn đã đăng ký, thanh toán hóa đơn và xem trạng thái.
                                        </h6>
                                    </div>
                                    {/* thừa */}
                                    {/* <div className="text-muted opacity-50" style={{fontSize: "2rem"}}>
                                        <i className="bi bi-p-circle"></i>
                                    </div> */}
                                </div>

                                <div className="card-body p-0">
                                    <div className="d-flex justify-content-end px-4 pt-4 pb-2">
                                        <div className="position-relative" style={{ width: "280px" }}>
                                            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                            <input
                                                type="search"
                                                className="form-control eco-search-input ps-5"
                                                placeholder="Tìm biển số / Gói cước..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table eco-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ paddingLeft: "30px" }}>Biển số xe</th>
                                                    <th>Thông tin xe</th>
                                                    <th>Gói cước</th>
                                                    <th>Thời gian</th>
                                                    <th>Trạng thái thẻ</th>
                                                    <th>Lý do từ chối</th>
                                                    <th style={{ paddingRight: "30px" }} className="text-end">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-5">
                                                            <i className="bi bi-inboxes text-muted fs-1 mb-3 d-block" style={{ opacity: 0.3 }}></i>
                                                            <span className="text-muted fw-semibold" style={{ fontSize: "1.1rem" }}>Bạn chưa có lịch sử đăng ký thẻ xe nào.</span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tableData.map((item) => (
                                                        <tr key={item.id}>
                                                            <td style={{ paddingLeft: "30px" }}>
                                                                <span className="fw-bolder" style={{ color: "#4F46E5", fontSize: "1.1rem", letterSpacing: "0.5px" }}>{item.licensePlate}</span>
                                                            </td>
                                                            <td>
                                                                <div className="fw-bold text-dark">{item.brandModel}</div>
                                                                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                                    <i className="bi bi-palette me-1"></i>{item.color} |
                                                                    <i className={`bi ${item.vehicleType === 'MOTORBIKE' ? 'bi-bicycle' : 'bi-car-front'} ms-2 me-1`}></i>
                                                                    {item.vehicleType === 'MOTORBIKE' ? 'Xe máy' : 'Ô tô'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {item.packageInfo ? (
                                                                    <>
                                                                        <div className="fw-bold text-dark">{item.packageInfo.name}</div>
                                                                        <div className="text-success fw-bold" style={{ fontSize: "0.9rem" }}>
                                                                            {formatVnd(item.packageInfo.price)}
                                                                        </div>
                                                                        <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                                                                            <i className="bi bi-calendar-event me-1"></i>Hạn: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "Chưa kích hoạt"}
                                                                        </div>
                                                                    </>
                                                                ) : <span className="text-muted fst-italic">Không có dữ liệu</span>}
                                                            </td>
                                                            <td>
                                                                <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                                    <i className="bi bi-plus-circle me-1"></i>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "-"}
                                                                </div>
                                                                <div className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                                                                    <i className="bi bi-calendar2-check me-1"></i>{item.issueDate ? new Date(item.issueDate).toLocaleString("vi-VN") : "-"}
                                                                </div>
                                                                <div className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                                                                    <i className="bi bi-pencil-square me-1"></i>{item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "-"}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {renderStatusBadge(item.status)}
                                                                {item.invoice && (
                                                                    <div className="mt-2">
                                                                        <button
                                                                            className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                                                                            style={{ color: "#4F46E5", fontSize: "0.85rem" }}
                                                                            onClick={() => openInvoiceModal(item.invoice)}
                                                                        >
                                                                            <i className="bi bi-receipt me-1"></i> Xem hóa đơn
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="text-danger" style={{ maxWidth: '150px', whiteSpace: 'normal', fontSize: "0.85rem" }}>
                                                                {item.status === 'REJECTED' ? item.rejectedReason : ''}
                                                            </td>
                                                            <td className="text-end" style={{ paddingRight: "30px" }}>
                                                                <div className="d-flex flex-column align-items-end gap-2">
                                                                    {(item.status === "PENDING" || item.status === "APPROVED_WAITING_PAYMENT" || item.status === "ACTIVE") && (
                                                                        <button
                                                                            className="btn eco-btn-action eco-btn-danger"
                                                                            onClick={() => handleCancel(item.id, item.status)}
                                                                        >
                                                                            {item.status === "ACTIVE" ? "Hủy thẻ xe" : "Hủy yêu cầu"}
                                                                        </button>
                                                                    )}

                                                                    {(item.status === "ACTIVE" || item.status === "EXPIRED") && (
                                                                        <button
                                                                            className="btn eco-btn-action eco-btn-primary"
                                                                            onClick={() => handleRenewCard(item.id)}
                                                                        >
                                                                            <i className="bi bi-arrow-repeat me-1"></i> Gia hạn
                                                                        </button>
                                                                    )}

                                                                    {item.status === "APPROVED_WAITING_PAYMENT" && (
                                                                        <button
                                                                            className="btn eco-btn-action eco-btn-success"
                                                                            onClick={() => handlePayment(item.invoice?.id)}
                                                                        >
                                                                            <i className="bi bi-credit-card-fill me-1"></i> Thanh toán
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-center mt-4 pb-4">
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
                </div>
            </main>
            <Footer />

            {/* MODAL CHI TIẾT HÓA ĐƠN */}
            {showInvoiceModal && selectedInvoice && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", zIndex: 1050 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content eco-modal-content">
                            <div className="modal-header eco-modal-header">
                                <h5 className="modal-title text-dark fw-bold">
                                    <i className="bi bi-receipt text-indigo me-2" style={{ color: "#4F46E5" }}></i>
                                    Chi tiết Hóa đơn #{selectedInvoice.id}
                                </h5>
                                <button type="button" className="btn-close shadow-none" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body eco-modal-body">
                                <div className="bg-light p-4 rounded-4 border" style={{ borderColor: "#EEF2FF" }}>
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                        <span className="text-muted fw-semibold">Số tiền cần thanh toán:</span>
                                        <strong className="text-danger fs-4 mb-0">
                                            {formatVnd(selectedInvoice.amount)}
                                        </strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted fw-semibold">Trạng thái:</span>
                                        <span>{renderInvoiceStatusBadge(selectedInvoice.status)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted fw-semibold">Phương thức:</span>
                                        <strong className="text-dark">{selectedInvoice.paymentMethod || "-"}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted fw-semibold">Mã giao dịch:</span>
                                        <span className="text-dark">{selectedInvoice.transactionId || "-"}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted fw-semibold">Ngày thanh toán:</span>
                                        <span className="text-dark">{selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString("vi-VN") : "-"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                                <button type="button" className="btn btn-light fw-bold w-100 rounded-3 py-2 text-muted" onClick={() => setShowInvoiceModal(false)}>
                                    Đóng cửa sổ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ParkingCardHistory;