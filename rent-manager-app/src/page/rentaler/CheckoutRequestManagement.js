import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  getCheckoutRequestsForRentaler,
  approveCheckoutRequest,
  rejectCheckoutRequest,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import moment from "moment";

function CheckoutRequestManagement(props) {
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
    getCheckoutRequestsForRentaler(currentPage, itemsPerPage)
      .then((response) => {
        setTableData(response?.content || []);
        setTotalItems(response?.totalElements || 0);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Không thể tải danh sách yêu cầu trả phòng.",
        );
      });
  };

  const handleUpdateStatus = (id, status) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn ${status === "APPROVED" ? "duyệt trả phòng" : "từ chối yêu cầu"} này?`,
      )
    )
      return;

    const requestApi =
      status === "APPROVED"
        ? approveCheckoutRequest(id)
        : rejectCheckoutRequest(id);
    requestApi
      .then((response) => {
        toast.success(
          response?.message ||
            `Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} yêu cầu trả phòng.`,
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
            <h5 className="card-title">Quản lý Yêu cầu trả phòng</h5>
            <h6 className="card-subtitle text-muted">
              Duyệt hoặc từ chối các yêu cầu trả phòng của người thuê. Việc
              duyệt sẽ tự động kết thúc hợp đồng hiện tại.
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
                        <th>Phòng</th>
                        <th>Người trả</th>
                        <th>Lý do</th>
                        <th>Ngày yêu cầu</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!tableData || tableData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            Chưa có yêu cầu trả phòng nào.
                          </td>
                        </tr>
                      ) : (
                        tableData.map((item) => (
                          <tr key={item.id}>
                            <td>{item.room?.title}</td>
                            <td>
                              {item.user?.name}
                              <br />
                              <small className="text-muted">
                                {item.user?.phone}
                              </small>
                            </td>
                            <td>{item.reason}</td>
                            <td>
                              {moment(item.createdAt).format(
                                "DD/MM/YYYY HH:mm",
                              )}
                            </td>
                            <td>
                              {item.status === "PENDING" && (
                                <span className="badge bg-warning text-dark">
                                  Chờ duyệt
                                </span>
                              )}
                              {item.status === "APPROVED" && (
                                <span className="badge bg-success">
                                  Đã duyệt
                                </span>
                              )}
                              {item.status === "REJECTED" && (
                                <span className="badge bg-danger">
                                  Từ chối
                                </span>
                              )}
                            </td>
                            <td>
                              {item.status === "PENDING" && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-2"
                                    onClick={() =>
                                      handleUpdateStatus(item.id, "APPROVED")
                                    }
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
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

export default CheckoutRequestManagement;
