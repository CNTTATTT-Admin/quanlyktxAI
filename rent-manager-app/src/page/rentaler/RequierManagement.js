import React, { useEffect, useState, useCallback } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  approveRequest,
  changeStatusOfRequest,
  deleteMaintenance,
  getAllMaintenceOfRentaler,
  getAllRequireOfRentaler,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import useAutoReload from "../../hooks/useAutoReload";

function RequierManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  // ==========================================
  // 🧠 LOGIC & STATE GIỮ NGUYÊN 100%
  // ==========================================
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from the API
  const fetchData = useCallback(() => {
    getAllRequireOfRentaler(currentPage, itemsPerPage, searchQuery)
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
    }, [currentPage, itemsPerPage, searchQuery]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    useAutoReload({ enabled: authenticated, onReload: fetchData });

    const notifyDataUpdated = () => {
      localStorage.setItem("app-data-updated-at", String(Date.now()));
      window.dispatchEvent(new Event("app-data-updated"));
    };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleExportBill = (id) => {
    history("/rentaler/export-bill/" + id);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeStatus = (id) => {
    changeStatusOfRequest(id)
      .then((response) => {
        console.log(response.message);
        toast.success("Yêu cầu đã được xử lý");
        notifyDataUpdated();
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleApprove = (id) => {
    approveRequest(id)
      .then((response) => {
        toast.success(response.message);
        notifyDataUpdated();
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
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

  // ==========================================
  // 🎨 GIAO DIỆN BẢNG ĐÃ TĂNG CỠ CHỮ
  // ==========================================
  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-input { border-radius: 50px; padding: 12px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; font-size: 1rem; }
        .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        
        .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.95rem; padding: 10px 24px; }
        .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        /* Table Styles Đã Tăng Cỡ Chữ & Padding */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
        .eco-table { margin-bottom: 0; width: 100%; min-width: 1000px; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.5px; padding: 18px 20px; border: none; white-space: nowrap; }
        .eco-table td { padding: 18px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 1rem; white-space: nowrap; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }
        
        /* Nút Action trong bảng lớn hơn chút */
        .btn-action-table { font-size: 0.95rem !important; padding: 8px 16px !important; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        {/* TIÊU ĐỀ & MÔ TẢ */}
        <div className="row mb-4 align-items-center">
          <div className="col-12">
            <h2 className="fw-bolder text-dark mb-1">Quản lý yêu cầu của người thuê</h2>
            <p className="text-muted mb-0">Theo dõi, phê duyệt và xử lý các yêu cầu thuê phòng từ khách hàng.</p>
          </div>
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="row mb-4">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="position-relative shadow-sm rounded-pill">
              <input
                type="text"
                className="form-control modern-input w-100 pe-5"
                placeholder="Tìm kiếm yêu cầu..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted" style={{fontSize: "1.1rem"}}></i>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="modern-table-wrapper mb-4">
          <table className="table table-hover eco-table">
            <thead>
              <tr>
                <th className="ps-4">Tên Phòng</th>
                <th>Tên Người Thuê</th>
                <th>Số điện thoại</th>
                <th>Mô tả yêu cầu</th>
                <th>Trạng thái</th>
                <th className="text-center pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50" style={{fontSize: "3rem"}}></i>
                      <span style={{fontSize: "1.1rem"}}>Không có yêu cầu nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4 fw-bold text-dark">
                      <i className="bi bi-door-open text-emerald me-2"></i>
                      {item.room.title}
                    </td>
                    <td className="fw-medium">{item.name}</td>
                    <td>{item.phoneNumber}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: "280px" }} title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td>
                      {item.isAnswer === true ? (
                        <span className="badge bg-success text-white rounded-pill px-3 py-2 shadow-sm" style={{fontSize: "0.9rem"}}>
                          <i className="bi bi-check-circle me-1"></i> Đã xử lý
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm" style={{fontSize: "0.9rem"}}>
                          <i className="bi bi-hourglass-split me-1"></i> Chưa xử lý
                        </span>
                      )}
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex justify-content-center gap-2">
                        
                        {item.isAnswer === false && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary shadow-sm rounded-pill fw-semibold btn-action-table"
                              onClick={() => handleApprove(item.id)}
                              disabled={item.room.currentOccupancy >= item.room.maxOccupancy}
                              title="Duyệt người này vào phòng"
                            >
                              <i className="bi bi-check2-all me-1"></i> 
                              Duyệt ({item.room.currentOccupancy}/{item.room.maxOccupancy})
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-secondary shadow-sm rounded-pill fw-semibold bg-white btn-action-table"
                              onClick={() => handleChangeStatus(item.id)}
                              title="Đánh dấu đã xử lý (không duyệt)"
                            >
                              <i className="bi bi-x-circle me-1"></i> Từ chối
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="btn btn-outline-info shadow-sm rounded-pill fw-semibold bg-white btn-action-table"
                          onClick={() => handleExportBill(item.id)}
                          title="Xem chi tiết yêu cầu"
                        >
                          <i className="bi bi-eye me-1"></i> Chi tiết
                        </button>

                      </div>
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
}

export default RequierManagement;