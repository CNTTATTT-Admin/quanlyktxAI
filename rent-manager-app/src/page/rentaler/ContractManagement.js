import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  disableRoom,
  getAllContractOfRentaler,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";

function ContractManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = () => {
    getAllContractOfRentaler(currentPage, itemsPerPage, searchQuery)
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

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRedirectAddRoom = () => {
    history("/rentaler/add-contract");
  };

  const handleEditContract = (id) => {
    history("/rentaler/edit-contract/" + id);
  };

  const handleExportBill = (id) => {
    history("/rentaler/export-contract/" + id);
  };

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

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-input { border-radius: 50px; padding: 10px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; background-color: #fff; }
        .modern-input:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        
        .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; font-size: 0.85rem; padding: 8px 20px; }
        .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        
        /* Table Styles Đã Tinh Chỉnh */
        .modern-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; overflow-x: auto; }
        .eco-table { margin-bottom: 0; width: 100%; min-width: 1000px; }
        .eco-table thead { background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
        .eco-table th { color: #1E293B; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.5px; padding: 12px 15px; border: none; white-space: nowrap; }
        .eco-table td { padding: 12px 15px; vertical-align: middle; border-bottom: 1px solid #F1F5F9; color: #475569; font-size: 0.85rem; white-space: nowrap; }
        .eco-table tbody tr { transition: all 0.2s ease; }
        .eco-table tbody tr:hover { background-color: #F0FDF4; }
        
        /* Nút Action trong bảng */
        .btn-table-action { width: 30px; height: 30px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; font-size: 0.85rem;}
        .btn-table-action:hover:not(:disabled) { transform: translateY(-2px); }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        
        <div className="row mb-4 align-items-center">
          <div className="col-md-8">
            <h2 className="fw-bolder text-dark mb-1">Quản lý hợp đồng</h2>
            <p className="text-muted mb-0">Theo dõi, quản lý hợp đồng và thời hạn thuê của khách hàng.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button className="btn bg-emerald text-white btn-modern shadow-sm" onClick={handleRedirectAddRoom}>
              <i className="bi bi-file-earmark-plus-fill me-2"></i> Thêm Hợp Đồng
            </button>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="position-relative shadow-sm rounded-pill">
              <input
                type="text"
                className="form-control modern-input w-100 pe-5"
                placeholder="Tìm kiếm hợp đồng..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted"></i>
            </div>
          </div>
        </div>

        <div className="modern-table-wrapper mb-4">
            <table className="table table-hover eco-table">
              <thead>
                <tr>
                  <th className="ps-4">Tên Hợp Đồng</th>
                  <th>Phòng</th>
                  <th>Người thuê</th>
                  <th>SĐT</th>
                  <th>File Hợp Đồng</th>
                  <th>Giá phòng</th>
                  <th>Phụ phí</th>
                  <th>Thời hạn</th>
                  <th>Trạng Thái</th>
                  <th className="text-end pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-folder-x fs-1 d-block mb-2 opacity-50"></i>
                        Không có dữ liệu hợp đồng.
                      </div>
                    </td>
                  </tr>
                ) : (
                  tableData.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4 fw-bold text-dark">{item.name}</td>
                      <td>
                        <span className="badge bg-light text-dark border rounded-pill px-2 py-1">
                          <i className="bi bi-door-open-fill text-emerald me-1"></i> {item.room.title}
                        </span>
                      </td>
                      <td className="fw-medium">{item.nameOfRent}</td>
                      <td>{item.phone}</td>
                      
                      <td>
                        {item.files ? (
                          <a
                            href={item.files}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-light text-info border shadow-sm rounded-pill px-3 py-1 fw-semibold text-decoration-none"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i> Xem file
                          </a>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>

                      <td className="fw-bold text-emerald">
                        {item.room.price &&
                          item.room.price.toLocaleString("vi-VN")} đ
                      </td>

                      <td className="fw-semibold text-dark">
                        {(() => {
                          const subFee =
                            item.room.waterCost +
                            item.room.publicElectricCost +
                            item.room.internetCost;
                          return subFee ? subFee.toLocaleString("vi-VN") + " đ" : "0 đ";
                        })()}
                      </td>

                      <td>
                        <span className="badge bg-light text-secondary border rounded-pill px-2 py-1">
                          {calculateRemainingMonths(new Date(item.deadlineContract))} tháng
                        </span>
                      </td>

                      <td>
                        {item.room.status === "AVAILABLE" && (
                          <span className="badge bg-success text-white rounded-pill px-2 py-1">Trống</span>
                        )}
                        {item.room.status === "PARTIALLY_FILLED" && (
                          <span className="badge bg-warning text-dark rounded-pill px-2 py-1">Còn chỗ</span>
                        )}
                        {item.room.status === "FULL" && (
                          <span className="badge bg-danger text-white rounded-pill px-2 py-1">Hết chỗ</span>
                        )}
                        {item.room.status === "MAINTENANCE" && (
                          <span className="badge bg-secondary text-white rounded-pill px-2 py-1">Bảo trì</span>
                        )}
                        {item.room.status === "ROOM_RENT" && (
                          <span className="badge bg-success text-white rounded-pill px-2 py-1">Còn chỗ</span>
                        )}
                        {item.room.status === "HIRED" && (
                          <span className="badge bg-danger text-white rounded-pill px-2 py-1">Hết chỗ</span>
                        )}
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-light text-primary border btn-table-action"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditContract(item.id);
                            }}
                            title="Sửa hợp đồng"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          
                          <button
                            className="btn bg-emerald text-white btn-table-action shadow-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleExportBill(item.id);
                            }}
                            title="Trả phòng & Xuất hóa đơn"
                          >
                            <i className="bi bi-receipt-cutoff"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
    </>
  );
}

export default ContractManagement;