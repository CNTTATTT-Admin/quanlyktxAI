import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import Pagination from "./Pagnation"; // Sửa lỗi tên import từ Pagnation thành Pagination
import { toast } from "react-toastify";
import { getAllElectricAndWaterOfRentaler } from "../../services/fetch/ApiUtils";
import { formatVnd } from "../../utils/currency";
import useAutoReload from "../../hooks/useAutoReload";

const ElectricAndWaterManagement = (props) => {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateRemainingMonths = (deadlineContract) => {
    const currentDate = new Date();
    const contractDate = new Date(deadlineContract);

    const remainingMonths =
      (contractDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (contractDate.getMonth() - currentDate.getMonth());

    return remainingMonths;
  };

  // Tất cả các hooks phải được gọi ở đây

  const fetchData = useCallback(() => {
    getAllElectricAndWaterOfRentaler(currentPage - 1, itemsPerPage, searchQuery)
      .then((response) => {
        console.log("dataTable", response);

        if (response && response.content) {
          const sortedContent = [...response.content].sort((a, b) => {
            if (a.paid !== b.paid) {
              return Number(a.paid) - Number(b.paid);
            }
            return (b.id || 0) - (a.id || 0);
          });

          setTableData(sortedContent);
          setTotalItems(response.totalElements);
        } else {
          setTableData([]);
          setTotalItems(0);
        }
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
        setTableData([]);
        setTotalItems(0);
      });
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated, fetchData]);

  useAutoReload({ enabled: authenticated, onReload: fetchData });

  console.log("tableData", tableData);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEditElectric = (id) => {
    history(`/rentaler/electric_water/edit/${id}`);
  };

  const handleRedirectAddElectric = () => {
    history(`/rentaler/electric_water/add`);
  };

  const handleExportBill = (id) => {
    history(`/rentaler/electric_water-management/export-bill/${id}`);
  };

  if (!authenticated) {
    return <Navigate to="/login-rentaler" state={{ from: location }} />;
  }

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-input { border-radius: 50px; padding: 12px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 0.9rem; }
        .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        
        .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.95rem; padding: 10px 24px; }
        .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        /* Table Styles */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
        .eco-table { margin-bottom: 0; width: 100%; min-width: 1300px; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.5px; padding: 12px 10px; border: none; white-space: nowrap; vertical-align: middle; }
        .eco-table td { padding: 18px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.9rem; white-space: nowrap; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }
        
        /* Nút Action trong bảng */
        .btn-action-table { width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; transition: all 0.2s; font-size: 0.9rem; }
        .btn-action-table:hover:not(:disabled) { transform: translateY(-2px); }
      `}</style>

      <div className="container-fluid p-4 eco-bg">

        {/* TIÊU ĐỀ & MÔ TẢ */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-8">
            <h2 className="fw-bolder text-dark mb-1">Quản lý tiền điện nước</h2>
            <p className="text-muted mb-0">Theo dõi, quản lý chỉ số và hóa đơn điện nước của khách thuê.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button className="btn bg-emerald text-white btn-modern shadow-sm" onClick={handleRedirectAddElectric}>
              <i className="bi bi-lightning-charge-fill me-2"></i> Thêm Hóa Đơn Mới
            </button>
          </div>
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="row mb-4">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="position-relative shadow-sm rounded-pill">
              <input
                type="text"
                className="form-control modern-input w-100 pe-5"
                placeholder="Tìm kiếm hóa đơn..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted" style={{ fontSize: "1.1rem" }}></i>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="modern-table-wrapper mb-4">
          <table className="table table-hover eco-table">
            <thead>
              <tr>
                <th className="ps-4">Tên hóa đơn</th>
                <th>Phòng</th>
                <th>Kỳ sử dụng</th>
                <th className="text-center">Chỉ số Điện <br /><small className="text-muted text-lowercase fw-normal">(Cũ ➔ Mới)</small></th>
                <th className="text-center">Chỉ số Nước <br /><small className="text-muted text-lowercase fw-normal">(Cũ ➔ Mới)</small></th>
                <th className="text-center" style={{ minWidth: "150px" }}>Tổng tiền điện</th>
                <th className="text-center" style={{ minWidth: "150px" }}>Tổng tiền nước</th>
                <th className="text-center" style={{ minWidth: "150px" }}>Tiền Internet</th>
                <th className="text-center" style={{ minWidth: "240px" }}>Người đã/ chưa đóng</th>
                <th>Trạng Thái</th>
                <th className="text-center pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-receipt fs-1 d-block mb-3 opacity-50" style={{ fontSize: "3rem" }}></i>
                      <span style={{ fontSize: "1.1rem" }}>Không có dữ liệu điện nước.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4 fw-bold text-dark">{item.name}</td>
                    <td>
                      <span className="badge bg-light text-dark border rounded-pill px-3 py-2 fs-6 shadow-sm">
                        <i className="bi bi-door-open text-emerald me-2"></i>
                        {item.room?.title}
                      </span>
                    </td>
                    <td className="fw-medium">Tháng {item.month}</td>

                    {/* Gộp Cột Điện */}
                    <td className="text-center fw-medium font-monospace">
                      <span className="text-muted">{item.lastMonthNumberOfElectric}</span>
                      <i className="bi bi-arrow-right mx-2 text-emerald"></i>
                      <span className="text-dark">{item.thisMonthNumberOfElectric}</span>
                    </td>

                    {/* Gộp Cột Nước */}
                    <td className="text-center fw-medium font-monospace">
                      <span className="text-muted">{item.lastMonthBlockOfWater}</span>
                      <i className="bi bi-arrow-right mx-2 text-info"></i>
                      <span className="text-dark">{item.thisMonthBlockOfWater}</span>
                    </td>

                    {/* Tổng tiền điện */}
                    <td className="text-center">
                      <div className="bg-light border rounded-3 p-2 w-100 text-start shadow-sm transition-all hover-card">
                        <div className="fw-bold text-danger mb-1" style={{ fontSize: "0.95rem" }}>
                          <i className="bi bi-lightning-charge-fill text-warning me-1 fs-6"></i>
                          {formatVnd(item.totalMoneyOfElectric)}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          Mỗi người: <span className="fw-semibold text-dark">{formatVnd(item.perPersonElectric)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tổng tiền nước */}
                    <td className="text-center">
                      <div className="bg-light border rounded-3 p-2 w-100 text-start shadow-sm transition-all hover-card">
                        <div className="fw-bold text-primary mb-1" style={{ fontSize: "0.95rem" }}>
                          <i className="bi bi-droplet-fill text-info me-1 fs-6"></i>
                          {formatVnd(item.totalMoneyOfWater)}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          Mỗi người: <span className="fw-semibold text-dark">{formatVnd(item.perPersonWater)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tổng tiền internet */}
                    <td className="text-center">
                      <div className="bg-light border rounded-3 p-2 w-100 text-start shadow-sm transition-all hover-card">
                        <div className="fw-bold text-success mb-1" style={{ fontSize: "0.95rem" }}>
                          <i className="bi bi-wifi text-success me-1 fs-6"></i>
                          {formatVnd(item.internetCost || 0)}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          Mỗi người: <span className="fw-semibold text-dark">{formatVnd(item.perPersonInternet || 0)}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="bg-light border rounded-3 p-2 shadow-sm" style={{ minWidth: "220px" }}>
                        <div className="mb-2">
                          <small className="text-success fw-bold d-block mb-1">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Đã đóng ({item.paidUsersCount || 0}/{item.totalUsersToPay || 0})
                          </small>
                          {item.paidUserNames && item.paidUserNames.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {item.paidUserNames.map((name, idx) => (
                                <span key={`paid-${item.id}-${idx}`} className="badge bg-success-subtle text-success border">{name}</span>
                              ))}
                            </div>
                          ) : (
                            <small className="text-muted fst-italic">Chưa có ai đóng</small>
                          )}
                        </div>
                        <div>
                          <small className="text-warning fw-bold d-block mb-1">
                            <i className="bi bi-hourglass-split me-1"></i>
                            Chưa đóng
                          </small>
                          {item.unpaidUserNames && item.unpaidUserNames.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {item.unpaidUserNames.map((name, idx) => (
                                <span key={`unpaid-${item.id}-${idx}`} className="badge bg-warning-subtle text-warning-emphasis border">{name}</span>
                              ))}
                            </div>
                          ) : (
                            <small className="text-muted fst-italic">Không còn ai chưa đóng</small>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td>
                      {item.paid ? (
                        <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm" style={{ fontSize: "0.85rem" }}>
                          <i className="bi bi-check-circle me-1"></i> Đã thanh toán
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm" style={{ fontSize: "0.85rem" }}>
                          <i className="bi bi-hourglass-split me-1"></i> Chưa thanh toán
                        </span>
                      )}
                    </td>

                    {/* Nút hành động */}
                    <td className="text-center pe-4">
                      <button
                        className="btn btn-light text-primary border shadow-sm btn-action-table"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditElectric(item.id);
                        }}
                        title="Sửa thông tin tiền điện nước"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            currentPage={currentPage}
            paginate={paginate}
          />
        </div>

      </div>
    </>
  );
};

export default ElectricAndWaterManagement;