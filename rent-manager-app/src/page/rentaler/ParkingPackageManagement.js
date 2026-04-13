import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiEdit, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { getAllParkingPackages, createParkingPackage, updateParkingPackage } from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";

const ParkingPackageManagement = (props) => {
    const { authenticated, location } = props;
    const history = useNavigate();

    const [packages, setPackages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        durationMonths: 1,
        price: "",
        vehicleType: "MOTORBIKE",
        status: "ACTIVE"
    });

    useEffect(() => {
        if (authenticated) {
            fetchData();
        }
    }, [currentPage, searchQuery, authenticated]);

    const fetchData = () => {
        getAllParkingPackages(currentPage - 1, itemsPerPage, searchQuery)
            .then((response) => {
                setPackages(response.content || []);
                setTotalItems(response.totalElements || 0);
            })
            .catch((error) => {
                toast.error((error && error.message) || "Lỗi khi tải danh sách gói cước!");
            });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openCreateModal = () => {
        setIsEditMode(false);
        setFormData({ id: null, name: "", durationMonths: 1, price: "", vehicleType: "MOTORBIKE", status: "ACTIVE" });
        setShowModal(true);
    };

    const openEditModal = (pkg) => {
        setIsEditMode(true);
        setFormData({
            id: pkg.id,
            name: pkg.name,
            durationMonths: pkg.durationMonths,
            price: pkg.price,
            vehicleType: pkg.vehicleType,
            status: pkg.status
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const apiCall = isEditMode ? updateParkingPackage(formData.id, formData) : createParkingPackage(formData);

        apiCall
            .then(() => {
                toast.success(isEditMode ? "Cập nhật gói cước thành công!" : "Thêm mới gói cước thành công!");
                setShowModal(false);
                fetchData();
            })
            .catch((error) => {
                toast.error((error && error.message) || "Có lỗi xảy ra, vui lòng thử lại!");
            });
    };

    const toggleStatus = (pkg) => {
        const newStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        updateParkingPackage(pkg.id, { ...pkg, status: newStatus })
            .then(() => {
                toast.success(`Đã chuyển trạng thái thành ${newStatus === "ACTIVE" ? "Hoạt động" : "Ngưng hoạt động"}`);
                fetchData();
            })
            .catch((err) => toast.error("Lỗi khi cập nhật trạng thái!"));
    };

    if (!authenticated) {
        return <Navigate to={{ pathname: "/login-rentaler", state: { from: location } }} />;
    }

    return (
        <>
            <style>{`
                .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .text-emerald { color: #10B981 !important; }
                .bg-emerald { background-color: #10B981 !important; color: white !important; }
                
                .modern-input { border-radius: 8px; padding: 10px 15px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 0.95rem; }
                .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
                .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
                
                .modern-input-search { border-radius: 50px; padding: 10px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 0.95rem; }
                .modern-input-search:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }

                .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.9rem; padding: 8px 20px; }
                .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                
                .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
                .eco-table { margin-bottom: 0; width: 100%; min-width: 900px; }
                .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
                .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; padding: 16px 20px; border: none; white-space: nowrap; vertical-align: middle; }
                .eco-table td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.95rem; white-space: nowrap; }
                .eco-table tbody tr { transition: all 0.2s ease; }
                .eco-table tbody tr:hover { background-color: #F0FDF4; }

                .btn-action-table { transition: all 0.2s; font-size: 0.85rem; padding: 6px 12px; border-radius: 8px; }
                .btn-action-table:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

                .btn-action-table.btn-outline-primary:hover:not(:disabled) {
                    background-color: #2563eb !important;
                    border-color: #2563eb !important;
                    color: #ffffff !important;
                }
                .btn-action-table.btn-outline-danger:hover:not(:disabled) {
                    background-color: #dc2626 !important;
                    border-color: #dc2626 !important;
                    color: #ffffff !important;
                }
                .btn-success.btn-action-table:hover:not(:disabled) {
                    background-color: #0f766e !important;
                    border-color: #0f766e !important;
                    color: #ffffff !important;
                }
                .btn-light.btn-modern:hover:not(:disabled),
                .btn-light.border.text-secondary.btn-modern:hover:not(:disabled) {
                    background-color: #f1f5f9 !important;
                    border-color: #cbd5e1 !important;
                    color: #334155 !important;
                }
                .bg-emerald.btn-modern:hover:not(:disabled),
                .btn.bg-emerald:hover:not(:disabled) {
                    background-color: #0d9488 !important;
                    border-color: #0d9488 !important;
                    color: #ffffff !important;
                }
                
                .modal-eco .modal-content { border-radius: 20px; border: none; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
                .modern-input:disabled, .modern-input[readonly] { background-color: #F1F5F9; color: #64748B; cursor: not-allowed; border-color: #E2E8F0; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">

                {/* Header */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-7 mb-3 mb-md-0">
                        <h2 className="fw-bolder text-dark mb-1">Quản lý Gói cước Gửi xe</h2>
                        <p className="text-muted mb-0">Thiết lập giá, thời hạn và trạng thái mở bán cho các loại xe.</p>
                    </div>
                    <div className="col-md-5 text-md-end d-flex justify-content-md-end flex-wrap gap-2">
                        <button
                            className="btn btn-light bg-white border text-secondary btn-modern shadow-sm"
                            onClick={() => history("/rentaler/parking-card-management")}
                        >
                            <i className="bi bi-arrow-left me-2"></i> Quay lại Thẻ xe
                        </button>
                        <button
                            className="btn bg-emerald text-white btn-modern shadow-sm"
                            onClick={openCreateModal}
                        >
                            <FiPlus className="me-1 fs-5 mb-1" /> Thêm Gói mới
                        </button>
                    </div>
                </div>

                {/* Tìm kiếm */}
                <div className="row mb-4">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="position-relative shadow-sm rounded-pill">
                            <input
                                type="search"
                                className="form-control modern-input-search w-100 pe-5"
                                placeholder="Tìm tên gói cước..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted" style={{ fontSize: "1.1rem" }}></i>
                        </div>
                    </div>
                </div>

                {/* Bảng Dữ Liệu */}
                <div className="modern-table-wrapper mb-4">
                    <table className="table table-hover eco-table">
                        <thead>
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Tên gói cước</th>
                                <th>Loại phương tiện</th>
                                <th>Thời hạn</th>
                                <th>Giá tiền</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center pe-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="bi bi-tags fs-1 d-block mb-3 opacity-50" style={{ fontSize: "2.5rem" }}></i>
                                            <span style={{ fontSize: "1rem" }}>Chưa có gói cước nào được tạo.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr key={pkg.id}>
                                        <td className="ps-4 text-muted fw-bold font-monospace">#{pkg.id}</td>
                                        <td className="fw-bolder text-dark fs-6">{pkg.name}</td>
                                        <td>
                                            {pkg.vehicleType === "CAR"
                                                ? <span className="badge bg-dark rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-car-front-fill me-1"></i> Ô tô</span>
                                                : <span className="badge bg-secondary rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-bicycle me-1"></i> Xe máy</span>
                                            }
                                        </td>
                                        <td className="fw-medium">
                                            <i className="bi bi-calendar3 text-emerald me-2"></i>
                                            <span className="fw-bold fs-6">{pkg.durationMonths}</span> tháng
                                        </td>
                                        <td className="text-danger fw-bolder fs-6">
                                            {pkg.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </td>
                                        <td className="text-center">
                                            {pkg.status === "ACTIVE"
                                                ? <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-check-circle-fill me-1"></i> Đang bán</span>
                                                : <span className="badge bg-danger text-white rounded-pill px-3 py-2 shadow-sm"><i className="bi bi-x-circle-fill me-1"></i> Ngưng bán</span>}
                                        </td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-outline-primary bg-white shadow-sm btn-action-table fw-semibold d-flex align-items-center"
                                                    onClick={() => openEditModal(pkg)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FiEdit className="me-1" /> Sửa
                                                </button>
                                                <button
                                                    className={`btn shadow-sm btn-action-table fw-semibold d-flex align-items-center ${pkg.status === "ACTIVE" ? "btn-outline-danger bg-white" : "btn-success text-white"}`}
                                                    onClick={() => toggleStatus(pkg)}
                                                    title={pkg.status === "ACTIVE" ? "Ngưng bán" : "Mở bán lại"}
                                                >
                                                    {pkg.status === "ACTIVE" ? <FiToggleLeft className="me-1 fs-5" /> : <FiToggleRight className="me-1 fs-5" />}
                                                    <span>{pkg.status === "ACTIVE" ? "Khóa" : "Mở bán"}</span>
                                                </button>
                                            </div>
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

            {/* Modal Thêm/Sửa Gói Cước */}
            {showModal && (
                <div className="modal fade show d-block modal-eco" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-white border-bottom p-3">
                                <h5 className="modal-title fw-bolder text-dark d-flex align-items-center">
                                    <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-plus-circle'} text-emerald me-2 fs-4`}></i>
                                    {isEditMode ? "Chỉnh sửa Gói Cước" : "Thêm Gói Cước Mới"}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                <div className="modal-body p-3 bg-light">
                                    <div className="bg-white p-3 rounded-4 border shadow-sm">
                                        <div className="mb-3">
                                            <label className="modern-label">Tên gói cước <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control modern-input"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="VD: Gói Gửi Ô tô 3 tháng..."
                                            />
                                        </div>

                                        <div className="row mb-3 g-3">
                                            <div className="col-md-6">
                                                <label className="modern-label">Loại xe <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select modern-input"
                                                    name="vehicleType"
                                                    value={formData.vehicleType}
                                                    onChange={handleInputChange}
                                                    disabled={isEditMode}
                                                >
                                                    <option value="MOTORBIKE">Xe máy</option>
                                                    <option value="CAR">Ô tô</option>
                                                </select>
                                                {isEditMode && <small className="text-muted" style={{ fontSize: "12px" }}>* Không thể sửa loại xe</small>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="modern-label">Thời hạn (Tháng) <span className="text-danger">*</span></label>
                                                <div className="position-relative">
                                                    <input
                                                        type="number"
                                                        className="form-control modern-input pe-5"
                                                        name="durationMonths"
                                                        min="1"
                                                        value={formData.durationMonths}
                                                        onChange={handleInputChange}
                                                        required
                                                        disabled={isEditMode}
                                                    />
                                                    <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted fw-bold">tháng</span>
                                                </div>
                                                {isEditMode && <small className="text-muted" style={{ fontSize: "12px" }}>* Không thể sửa thời hạn</small>}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="modern-label">Giá tiền thanh toán <span className="text-danger">*</span></label>
                                            <div className="position-relative">
                                                <input
                                                    type="number"
                                                    className="form-control modern-input pe-5 text-danger fw-bold fs-5"
                                                    name="price"
                                                    min="0"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={isEditMode}
                                                />
                                                <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted fw-bold">VNĐ</span>
                                            </div>
                                            {isEditMode && <small className="text-muted" style={{ fontSize: "12px" }}>* Không thể sửa giá sau khi tạo</small>}
                                        </div>

                                        <div className="mb-2 border-top pt-2">
                                            <label className="modern-label">Trạng thái hiển thị</label>
                                            <select
                                                className={`form-select modern-input fw-bold ${formData.status === 'ACTIVE' ? 'text-success' : 'text-danger'}`}
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="ACTIVE">Đang bán (Khách có thể mua)</option>
                                                <option value="INACTIVE">Ngưng bán (Ẩn khỏi danh sách)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-white border-top p-3">
                                    <button type="button" className="btn btn-light border text-secondary btn-modern" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                    <button type="submit" className="btn bg-emerald text-white btn-modern px-4 shadow-sm">
                                        <i className={`bi ${isEditMode ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}></i>
                                        {isEditMode ? "Lưu thay đổi" : "Tạo gói cước"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ParkingPackageManagement;