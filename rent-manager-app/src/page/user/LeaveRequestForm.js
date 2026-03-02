import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarNav from "./SidebarNav";
import {
  createLeaveRequest,
  getLeaveRequestsByUser,
} from "../../services/fetch/ApiUtils";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Pagination from "./Pagnation";

function LeaveRequestForm(props) {
  const { authenticated, currentUser, location, onLogout } = props;

  const [leaveData, setLeaveData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (authenticated) {
      fetchUserRequests();
    }
  }, [currentPage, authenticated]);

  const fetchUserRequests = () => {
    getLeaveRequestsByUser(currentPage - 1, itemsPerPage)
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setLeaveData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Convert date strings to ISO format for Backend
    const formattedData = {
      ...leaveData,
      startDate: leaveData.startDate ? `${leaveData.startDate}T00:00:00` : null,
      endDate: leaveData.endDate ? `${leaveData.endDate}T23:59:59` : null,
    };

    createLeaveRequest(formattedData)
      .then((response) => {
        toast.success("Gửi đơn xin nghỉ thành công!");
        setLeaveData({
          reason: "",
          startDate: "",
          endDate: "",
        });
        fetchUserRequests();
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!authenticated) {
    return <Navigate to={{ pathname: "/login", state: { from: location } }} />;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return { color: "green", fontWeight: "bold" };
      case "REJECTED":
        return { color: "red", fontWeight: "bold" };
      default:
        return { color: "orange", fontWeight: "bold" };
    }
  };

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
            <div className="container-fluid p-0">
              <div className="row">
                <div className="col-12 col-xl-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">Viết đơn xin nghỉ</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Ngày bắt đầu</label>
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={leaveData.startDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Ngày kết thúc</label>
                          <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={leaveData.endDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Lý do</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="reason"
                            value={leaveData.reason}
                            onChange={handleInputChange}
                            placeholder="Nhập lý do nghỉ..."
                            required
                          ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                          Gửi đơn
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-xl-8">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">Lịch sử xin nghỉ</h5>
                    </div>
                    <div className="card-body">
                      <table
                        className="table table-striped"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Lý do</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center">
                                Chưa có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            tableData.map((item) => (
                              <tr key={item.id}>
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
                                <td style={getStatusStyle(item.status)}>
                                  {item.status === "PENDING"
                                    ? "Chờ duyệt"
                                    : item.status === "APPROVED"
                                      ? "Đã duyệt"
                                      : "Từ chối"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      <Pagination
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        paginate={paginate}
                        currentPage={currentPage}
                      />
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

export default LeaveRequestForm;
