import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import SidebarNav from "./SidebarNav";
import Header from "../../common/Header";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCheckInOutHistory } from "../../services/fetch/ApiUtils";

const CheckInOutHistory = (props) => {
  const { authenticated, currentUser, onLogout, loadCurrentUser, location } =
    props;
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
      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <div style={{ marginTop: "140px" }}></div>
      <main id="main">
        <div className="wrapper">
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <main style={{ margin: "20px" }}>
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    Lịch sử điểm danh (Face ID)
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover my-0">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Loại</th>
                          <th>Độ tin cậy</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingHistory ? (
                          <tr>
                            <td colSpan="4" className="text-center">
                              Đang tải...
                            </td>
                          </tr>
                        ) : historyData.length > 0 ? (
                          historyData.map((log) => (
                            <tr key={log.id}>
                              <td>
                                {new Date(log.checkTime).toLocaleString()}
                              </td>
                              <td>
                                <span
                                  className={`badge ${log.checkType === "CHECK_IN" ? "bg-success" : "bg-danger"}`}
                                >
                                  {log.checkType}
                                </span>
                              </td>
                              <td>{(log.confidence * 100).toFixed(1)}%</td>
                              <td>
                                <span
                                  className={`badge ${log.success ? "bg-success" : "bg-danger"}`}
                                >
                                  {log.success ? "Thành công" : "Thất bại"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">
                              Chưa có lịch sử điểm danh.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-3">
                      <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                          <li
                            className={`page-item ${page === 0 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setPage(page - 1)}
                            >
                              Trước
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, i) => (
                            <li
                              key={i}
                              className={`page-item ${page === i ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
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
                              className="page-link"
                              onClick={() => setPage(page + 1)}
                            >
                              Sau
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckInOutHistory;
