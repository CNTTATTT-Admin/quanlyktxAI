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
            <div className="container-fluid p-0">
                <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="card-title mb-0">Quản lý Gói cước Gửi xe</h5>
                            <h6 className="card-subtitle text-muted mt-1">Thiết lập giá và thời hạn cho các loại xe.</h6>
                        </div>
                        <div>
                            <button className="btn btn-outline-secondary me-2 shadow-sm" onClick={() => history("/rentaler/parking-card-management")}>
                                &larr; Quay lại Thẻ xe
                            </button>
                            <button className="btn btn-primary shadow-sm" onClick={openCreateModal}>
                                <FiPlus className="me-1" /> Thêm Gói mới
                            </button>
                        </div>
                    </div>
                    
                    <div className="card-body">
                        <div className="row mb-3">
                            <div className="col-sm-12 col-md-6"></div>
                            <div className="col-sm-12 col-md-6 text-end">
                                <label className="d-flex align-items-center justify-content-end">
                                    <span className="me-2 text-muted fw-bold">Tìm kiếm:</span>
                                    <input
                                        type="search"
                                        className="form-control form-control-sm w-auto shadow-sm"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Tên gói cước..."
                                    />
                                </label>
                            </div>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên gói</th>
                                        <th>Loại xe</th>
                                        <th>Thời hạn</th>
                                        <th>Giá tiền</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {packages.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có gói cước nào được tạo.</td></tr>
                                    ) : (
                                        packages.map((pkg) => (
                                            <tr key={pkg.id}>
                                                <td className="text-muted fw-bold">#{pkg.id}</td>
                                                <td className="fw-bold text-primary">{pkg.name}</td>
                                                <td>
                                                    {pkg.vehicleType === "CAR" 
                                                        ? <span className="badge bg-dark"><i className="fas fa-car"></i> Ô tô</span>
                                                        : <span className="badge bg-secondary"><i className="fas fa-motorcycle"></i> Xe máy</span>
                                                    }
                                                </td>
                                                <td><strong>{pkg.durationMonths}</strong> tháng</td>
                                                <td className="text-danger fw-bold">
                                                    {pkg.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                </td>
                                                <td>
                                                    {pkg.status === "ACTIVE" 
                                                        ? <span className="badge bg-success">Đang bán</span> 
                                                        : <span className="badge bg-danger">Ngưng bán</span>}
                                                </td>
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-2 shadow-sm" 
                                                        onClick={() => openEditModal(pkg)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FiEdit /> Sửa
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm shadow-sm ${pkg.status === "ACTIVE" ? "btn-outline-danger" : "btn-outline-success"}`}
                                                        onClick={() => toggleStatus(pkg)}
                                                        title={pkg.status === "ACTIVE" ? "Ngưng bán" : "Mở bán lại"}
                                                    >
                                                        {pkg.status === "ACTIVE" ? <FiToggleLeft /> : <FiToggleRight />} 
                                                        <span className="ms-1">{pkg.status === "ACTIVE" ? "Khóa" : "Mở"}</span>
                                                    </button>
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

            {/* Modal Thêm/Sửa Gói Cước */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header bg-light">
                                    <h5 className="modal-title fw-bold text-primary">
                                        {isEditMode ? "Chỉnh sửa Gói Cước" : "Thêm Gói Cước Mới"}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tên gói cước <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required placeholder="VD: Gói Gửi Ô tô 3 tháng..." />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Loại xe <span className="text-danger">*</span></label>
                                            <select className="form-select" name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} disabled={isEditMode}>
                                                <option value="MOTORBIKE">Xe máy</option>
                                                <option value="CAR">Ô tô</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Thời hạn (Tháng) <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control" name="durationMonths" min="1" value={formData.durationMonths} onChange={handleInputChange} required disabled={isEditMode} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Giá tiền (VNĐ) <span className="text-danger">*</span></label>
                                        <input type="number" className="form-control" name="price" min="0" value={formData.price} onChange={handleInputChange} required disabled={isEditMode} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Trạng thái</label>
                                        <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                            <option value="ACTIVE">Đang bán (Active)</option>
                                            <option value="INACTIVE">Ngưng bán (Inactive)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                    <button type="submit" className="btn btn-primary">
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