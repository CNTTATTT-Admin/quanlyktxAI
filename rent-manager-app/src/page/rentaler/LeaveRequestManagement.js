import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  getLeaveRequestsForRentaler,
  updateLeaveRequestStatus,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

function LeaveRequestManagement(props) {
  const { authenticated, currentUser, location, onLogout } = props;

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [currentPage, authenticated]);

  const fetchData = () => {
    getLeaveRequestsForRentaler(currentPage - 1, itemsPerPage)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải danh sách đơn nghỉ.",
        );
      });
  };

  const handleUpdateStatus = (id, status) => {
    updateLeaveRequestStatus(id, status)
      .then(() => {
        toast.success(
          `Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} đơn nghỉ.`,
        );
        fetchData();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Gặp lỗi khi cập nhật trạng thái.",
        );
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!props.authenticated) {
    return (
      <Navigate
        to={{ pathname: "/login-rentaler", state: { from: location } }}
      />
    );
  }

  return (
    <>
      <div className="container-fluid p-0">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Quản lý đơn xin nghỉ</h5>
            <h6 className="card-subtitle text-muted">
              Duyệt hoặc từ chối các đơn xin nghỉ của người thuê.
            </h6>
          </div>
          <div className="card-body">
            <div
              id="datatables-buttons_wrapper"
              className="dataTables_wrapper dt-bootstrap5 no-footer"
            >
              <div className="row dt-row">
                <div className="col-sm-12">
                  <table
                    className="table table-striped dataTable no-footer"
                    style={{ width: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th>Người thuê</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Lý do</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: "center" }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        tableData.map((item) => (
                          <tr key={item.id}>
                            <td>{item.user.name}</td>
                            <td>
                              {new Date(item.startDate).toLocaleDateString(
                                "vi-VN",
                              )}
                            </td>
                            <td>
                              {new Date(item.endDate).toLocaleDateString(
                                "vi-VN",
                              )}
                            </td>
                            <td>{item.reason}</td>
                            <td>
                              <span
                                className={`badge rounded-pill bg-${item.status === "PENDING" ? "warning" : item.status === "APPROVED" ? "success" : "danger"}`}
                              >
                                {item.status === "PENDING"
                                  ? "Chờ duyệt"
                                  : item.status === "APPROVED"
                                    ? "Đã duyệt"
                                    : "Từ chối"}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {item.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() =>
                                      handleUpdateStatus(item.id, "APPROVED")
                                    }
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                      handleUpdateStatus(item.id, "REJECTED")
                                    }
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
    </>
  );
}

export default LeaveRequestManagement;
