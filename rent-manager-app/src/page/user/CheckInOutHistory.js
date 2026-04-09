import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import SidebarNav from "./SidebarNav";
import Header from "../../common/Header";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCheckInOutHistory } from "../../services/fetch/ApiUtils";

const CheckInOutHistory = (props) => {
  const { authenticated, currentUser, onLogout, loadCurrentUser, location } = props;
  const [historyData, setHistoryData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetchHistory(page);
    }
  }, [authenticated, page]);

  const fetchHistory = (pageNumber) => {
    setLoadingHistory(true);
    getCheckInOutHistory(pageNumber, 10)
      .then((data) => {
        setHistoryData(data.content || []);
        setTotalPages(data.totalPages || 0);
        setLoadingHistory(false);
      })
      .catch((error) => {
        toast.error("Không thể tải lịch sử điểm danh.");
        setLoadingHistory(false);
      });
  };

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          state: { from: location },
        }}
      />
    );
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

        .main {
          flex-grow: 1;
          min-width: 0;
        }

        .eco-main-wrapper {
          padding: 30px;
          width: 100%;
        }

        .eco-card-table {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF;
          overflow: hidden;
        }

        .eco-card-header {
          background-color: #ffffff;
          padding: 25px 30px 20px 30px;
          border-bottom: 1px solid #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .eco-title-icon {
          color: #4F46E5;
          margin-right: 10px;
          font-size: 1.3rem;
        }

        .eco-table {
          margin-bottom: 0;
          color: #1E293B;
        }

        .eco-table thead th {
          background-color: #F8FAFC;
          color: #64748B;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 20px;
          border-bottom: 1px solid #E2E8F0;
          border-top: none;
          vertical-align: middle;
          white-space: nowrap;
        }

        .eco-table tbody td {
          padding: 18px 20px;
          vertical-align: middle;
          border-bottom: 1px solid #F1F5F9;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s ease;
          white-space: nowrap;
        }

        .eco-table tbody tr:hover td {
          background-color: #F8FAFC;
        }

        .eco-badge {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .eco-badge-in { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .eco-badge-out { background-color: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
        .eco-badge-success { background-color: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
        .eco-badge-fail { background-color: #FFF1F2; color: #E11D48; border: 1px solid #FECDD3; }

        .eco-pagination .page-item .page-link {
          color: #475569;
          background-color: #ffffff;
          border: 1px solid #E2E8F0;
          padding: 8px 16px;
          margin: 0 4px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .eco-pagination .page-item.active .page-link {
          z-index: 3;
          color: #ffffff;
          background-color: #4F46E5;
          border-color: #4F46E5;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }

        .eco-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
          background-color: #EEF2FF;
          color: #4F46E5;
          border-color: #C7D2FE;
        }

        .eco-pagination .page-item.disabled .page-link {
          color: #94A3B8;
          background-color: #F8FAFC;
          border-color: #E2E8F0;
        }
      `}</style>

      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      {/* Spacer đẩy xuống dưới Header */}
      <div style={{ marginTop: "70px" }}></div>
      
      <div className="eco-page-bg">
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
                      <i className="bi bi-person-bounding-box eco-title-icon"></i>
                      Lịch sử điểm danh Face ID
                    </h4>
                    <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                      Theo dõi quá trình ra vào khu vực bằng khuôn mặt của bạn.
                    </h6>
                  </div>
                  {/* thừa */}
                  {/* <div className="text-muted opacity-50" style={{fontSize: "2rem"}}>
                    <i className="bi bi-camera-video"></i>
                  </div> */}
                </div>
                
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table eco-table">
                      <thead>
                        <tr>
                          <th style={{ paddingLeft: "30px" }}>Thời gian quét</th>
                          <th>Loại điểm danh</th>
                          <th>Độ tin cậy (AI)</th>
                          <th style={{ paddingRight: "30px" }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingHistory ? (
                          <tr>
                            <td colSpan="4" className="text-center py-5">
                              <div className="spinner-border text-indigo mb-3" role="status" style={{color: "#4F46E5"}}></div>
                              <div className="text-muted fw-semibold">Đang tải dữ liệu...</div>
                            </td>
                          </tr>
                        ) : historyData.length > 0 ? (
                          historyData.map((log) => (
                            <tr key={log.id}>
                              <td style={{ paddingLeft: "30px" }} className="text-dark">
                                <i className="bi bi-clock me-2 text-muted"></i>
                                {new Date(log.checkTime).toLocaleString("vi-VN")}
                              </td>
                              <td>
                                <span
                                  className={`eco-badge ${log.checkType === "CHECK_IN" ? "eco-badge-in" : "eco-badge-out"}`}
                                >
                                  {log.checkType === "CHECK_IN" ? (
                                    <><i className="bi bi-box-arrow-in-right"></i> CHECK IN</>
                                  ) : (
                                    <><i className="bi bi-box-arrow-right"></i> CHECK OUT</>
                                  )}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="progress flex-grow-1" style={{height: "6px", maxWidth: "100px", backgroundColor: "#E2E8F0"}}>
                                    <div 
                                      className={`progress-bar ${log.confidence > 0.8 ? "bg-success" : "bg-warning"}`} 
                                      role="progressbar" 
                                      style={{ width: `${(log.confidence * 100).toFixed(0)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-muted" style={{fontSize: "0.85rem"}}>
                                    {(log.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ paddingRight: "30px" }}>
                                <span
                                  className={`eco-badge ${log.success ? "eco-badge-success" : "eco-badge-fail"}`}
                                >
                                  {log.success ? (
                                    <><i className="bi bi-check-circle-fill"></i> Thành công</>
                                  ) : (
                                    <><i className="bi bi-x-circle-fill"></i> Thất bại</>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-5">
                              <i className="bi bi-inboxes text-muted fs-1 mb-3 d-block" style={{opacity: 0.3}}></i>
                              <span className="text-muted fw-semibold" style={{fontSize: "1.1rem"}}>Chưa có lịch sử điểm danh nào.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4 pb-4">
                      <nav aria-label="Page navigation">
                        <ul className="pagination eco-pagination mb-0">
                          <li
                            className={`page-item ${page === 0 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link shadow-none"
                              onClick={() => setPage(page - 1)}
                            >
                              <i className="bi bi-chevron-left me-1"></i> Trước
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, i) => (
                            <li
                              key={i}
                              className={`page-item ${page === i ? "active" : ""}`}
                            >
                              <button
                                className="page-link shadow-none"
                                onClick={() => setPage(i)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${page === totalPages - 1 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link shadow-none"
                              onClick={() => setPage(page + 1)}
                            >
                              Sau <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default CheckInOutHistory;