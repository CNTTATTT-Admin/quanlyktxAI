import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarNav from "./SidebarNav";
import {
  getElectricByRoomUser,
  payElectricBill,
} from "../../services/fetch/ApiUtils";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Pagination from "./Pagnation";

function ElectricAndWaterUserPage(props) {

  const { authenticated, currentUser, location, onLogout } = props;

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (authenticated && currentUser?.allocatedRoomId) {
      fetchElectricBills();
    }
  }, [currentPage, authenticated, currentUser]);

  const fetchElectricBills = () => {
    if (!currentUser?.allocatedRoomId) return;

    getElectricByRoomUser(currentUser.allocatedRoomId)
      .then((response) => {
        // Since backend returns a direct array for this endpoint currently, check if it's an array
        const data = Array.isArray(response)
          ? response
          : response.content || [];

        // Paginate manually since backend might return a direct array without pagination metadata
        // for this new endpoint `getElectricByRoomUser`
        const total = Array.isArray(response)
          ? response.length
          : response.totalElements || data.length;

        // sort by month or ID
        data.sort((a, b) => b.id - a.id);

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = Array.isArray(response)
          ? data.slice(indexOfFirstItem, indexOfLastItem)
          : data;

        setTableData(currentItems);
        setTotalItems(total);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải hóa đơn điện nước.",
        );
      });
  };

  const handlePay = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn thanh toán hóa đơn này không?")) {
      payElectricBill(id)
        .then((response) => {
          toast.success(response?.message || "Thanh toán thành công");
          fetchElectricBills();
        })
        .catch((error) => {
          toast.error((error && error.message) || "Thanh toán thất bại.");
        });
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
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

        .wrapper { display: flex; align-items: stretch; width: 100%; flex-grow: 1; }
        
        #sidebar.sidebar {
          background-color: #ffffff !important; position: relative !important; align-self: stretch !important; 
          min-height: 100% !important; width: 260px !important; min-width: 260px !important; max-width: 260px !important;
          border-right: 1px solid #EEF2FF; z-index: 1000; top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
        }

        .sidebar-content {
          position: sticky !important; top: 70px !important; height: calc(100vh - 70px) !important;
          overflow-y: auto !important; background-color: #ffffff !important; display: flex; flex-direction: column;
        }
        
        .sidebar-content::-webkit-scrollbar { width: 4px; }
        .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

        .main { flex-grow: 1; min-width: 0; }

        .eco-main-wrapper { padding: 30px; width: 100%; }

        .eco-card {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF; overflow: hidden; height: 100%; display: flex; flex-direction: column;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
          display: flex; justify-content: space-between; align-items: center;
        }

        .eco-table { margin-bottom: 0; color: #1E293B; }
        .eco-table thead th {
          background-color: #F8FAFC; color: #64748B; font-size: 0.8rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px; padding: 16px 20px;
          border-bottom: 1px solid #E2E8F0; border-top: none; vertical-align: middle; white-space: nowrap;
        }
        .eco-table tbody td {
          padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid #F1F5F9;
          font-size: 0.95rem; font-weight: 500; transition: background-color 0.2s ease; white-space: nowrap;
        }
        .eco-table tbody tr:hover td { background-color: #F8FAFC; }

        .eco-badge {
          padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .eco-badge-success { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .eco-badge-warning { background-color: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }

        .eco-btn-pay {
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff; font-weight: 600; font-size: 0.85rem;
          padding: 8px 16px; border-radius: 8px; border: none; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
          transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center;
        }
        .eco-btn-pay:hover {
          transform: translateY(-2px); box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3); color: #ffffff;
        }

        .eco-pagination .page-item .page-link {
          color: #475569; background-color: #ffffff; border: 1px solid #E2E8F0; padding: 8px 16px; 
          margin: 0 4px; border-radius: 8px; font-weight: 600; transition: all 0.2s ease;
        }
        .eco-pagination .page-item.active .page-link {
          z-index: 3; color: #ffffff; background-color: #4F46E5; border-color: #4F46E5; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }
        .eco-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
          background-color: #EEF2FF; color: #4F46E5; border-color: #C7D2FE;
        }
      `}</style>

      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
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
              <div className="row">
                <div className="col-12">
                  <div className="eco-card">
                    <div className="eco-card-header">
                      <div>
                        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center">
                          <i className="bi bi-droplet-half text-info fs-4 me-2"></i>
                          <i className="bi bi-lightning-charge-fill text-warning fs-4 me-2"></i>
                          Hóa đơn điện nước
                        </h4>
                        <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                          Tra cứu và thanh toán chi phí điện, nước sinh hoạt hàng tháng.
                        </h6>
                      </div>
                    </div>
                    
                    <div className="card-body p-0 flex-grow-1 d-flex flex-column">
                      {!currentUser?.allocatedRoomId ? (
                        <div className="p-4">
                          <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning-emphasis p-4 rounded-4 text-center" style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                            <i className="bi bi-house-exclamation fs-1 d-block mb-3 opacity-50"></i>
                            Bạn chưa được phân phòng nên hiện tại hệ thống chưa có hóa đơn điện nước.
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="table-responsive">
                            <table className="table eco-table">
                              <thead>
                                <tr>
                                  <th style={{ paddingLeft: "30px" }}>Tên hóa đơn</th>
                                  <th>Kỳ thu</th>
                                  <th className="text-center">Tiêu thụ</th>
                                  <th className="text-center">Tổng tiền phòng</th>
                                  <th>Cần đóng cá nhân</th>
                                  <th className="text-center">Trạng thái</th>
                                  <th className="text-end" style={{ paddingRight: "30px" }}>Hành động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.length === 0 ? (
                                  <tr>
                                    <td colSpan="7" className="text-center py-5">
                                      <i className="bi bi-receipt text-muted fs-1 mb-3 d-block" style={{opacity: 0.2}}></i>
                                      <span className="text-muted fw-semibold" style={{fontSize: "1.05rem"}}>Chưa có hóa đơn nào.</span>
                                    </td>
                                  </tr>
                                ) : (
                                  tableData.map((item) => (
                                    <tr key={item.id}>
                                      <td style={{ paddingLeft: "30px" }} className="fw-bold text-dark">{item.name}</td>
                                      <td>
                                        <span className="text-muted"><i className="bi bi-calendar-event me-1"></i> Tháng {item.month}</span>
                                      </td>
                                      
                                      <td className="text-center">
                                        <div className="d-flex flex-column align-items-center gap-1" style={{fontSize: "0.85rem"}}>
                                          {/* ĐÃ FIX LỖI MÀU CHỮ: Dùng text-warning-emphasis thay vì text-warning */}
                                          <span className="text-warning-emphasis bg-warning bg-opacity-10 px-2 py-1 rounded w-100 text-start fw-semibold">
                                            <i className="bi bi-lightning-charge-fill me-1"></i>
                                            {item.thisMonthNumberOfElectric - item.lastMonthNumberOfElectric} kWh
                                          </span>
                                          {/* ĐÃ FIX LỖI MÀU CHỮ: Dùng text-info-emphasis thay vì text-info */}
                                          <span className="text-info-emphasis bg-info bg-opacity-10 px-2 py-1 rounded w-100 text-start fw-semibold">
                                            <i className="bi bi-droplet-fill me-1"></i>
                                            {item.thisMonthBlockOfWater - item.lastMonthBlockOfWater} Khối
                                          </span>
                                        </div>
                                      </td>
                                      
                                      <td className="text-center">
                                        <div className="d-flex flex-column gap-1 text-muted" style={{fontSize: "0.85rem"}}>
                                          <span>
                                            {item.totalMoneyOfElectric?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} (Điện)
                                          </span>
                                          <span>
                                            {item.totalMoneyOfWater?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} (Nước)
                                          </span>
                                        </div>
                                      </td>
                                      
                                      <td>
                                        <strong className="text-danger fs-5">
                                          {((item.perPersonElectric || 0) + (item.perPersonWater || 0)).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                        </strong>
                                        <br />
                                        <small className="text-muted" style={{fontSize: "0.75rem"}}>
                                          Chia rẽ: Điện {item.perPersonElectric?.toLocaleString("vi-VN")} đ / Nước {item.perPersonWater?.toLocaleString("vi-VN")} đ
                                        </small>
                                      </td>
                                      
                                      <td className="text-center">
                                        {item.paid ? (
                                          <span className="eco-badge eco-badge-success">
                                            <i className="bi bi-check-circle-fill"></i> Đã thanh toán
                                          </span>
                                        ) : (
                                          <span className="eco-badge eco-badge-warning">
                                            <i className="bi bi-exclamation-circle-fill"></i> Chưa thanh toán
                                          </span>
                                        )}
                                      </td>
                                      
                                      <td className="text-end" style={{ paddingRight: "30px" }}>
                                        {!item.paid ? (
                                          <button
                                            className="eco-btn-pay"
                                            onClick={() => handlePay(item.id)}
                                          >
                                            <i className="bi bi-credit-card-fill me-1"></i> Thanh toán
                                          </button>
                                        ) : (
                                          <span className="text-muted" style={{opacity: 0.3}}>-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Phân trang tự động đẩy xuống dưới */}
                          <div className="mt-auto pt-4 pb-4 d-flex justify-content-center border-top" style={{ borderColor: "#EEF2FF" }}>
                            <Pagination
                              itemsPerPage={itemsPerPage}
                              totalItems={totalItems}
                              paginate={paginate}
                              currentPage={currentPage}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ElectricAndWaterUserPage;