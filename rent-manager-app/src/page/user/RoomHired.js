import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import { getAllRoomHired } from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

function RoomHired(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data from the API
  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [currentPage, authenticated, currentUser]);

  const fetchData = () => {
    const phone = currentUser?.phone || "";
    getAllRoomHired(currentPage, itemsPerPage, phone)
      .then((response) => {
        setTableData(response.content || []);
        setTotalItems(response.totalElements || 0);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleSendRequest = (id) => {
    navigate("/send-request/" + id);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateRemainingMonths = (deadlineContract) => {
    if (!deadlineContract) return 0;
    const currentDate = new Date();
    const contractDate = new Date(deadlineContract);

    const remainingMonths =
      (contractDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (contractDate.getMonth() - currentDate.getMonth());

    return remainingMonths > 0 ? remainingMonths : 0;
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
              <span className="sidebar-brand">
                <span className="align-middle">RENTALER PRO</span>
              </span>
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <br />
            <div className="container-fluid p-0"></div>
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Lịch sử thuê phòng</h5>
                <h6 className="card-subtitle text-muted">
                  {" "}
                  Hiển thị lịch sử thuê phòng.
                </h6>
              </div>
              <div className="card-body">
                <div
                  id="datatables-buttons_wrapper"
                  className="dataTables_wrapper dt-bootstrap5 no-footer"
                >
                  <div className="row">
                    <div className="col-sm-12 col-md-6">
                      <div className="dt-buttons btn-group flex-wrap"></div>
                    </div>
                    <div className="col-sm-12 col-md-6">
                      <div
                        id="datatables-buttons_filter"
                        className="dataTables_filter"
                      ></div>
                    </div>
                  </div>
                  <div className="row dt-row">
                    <div className="col-sm-12">
                      <table
                        id="datatables-buttons"
                        className="table table-striped dataTable no-footer dtr-inline"
                        style={{ width: "100%" }}
                        aria-describedby="datatables-buttons_info"
                      >
                        <thead>
                          <tr>
                            <th style={{ width: "224px" }}>Tên Phòng</th>
                            <th style={{ width: "180px" }}>Người thuê</th>
                            <th style={{ width: "180px" }}>Số điện thoại</th>
                            <th style={{ width: "75px" }}>Giá</th>
                            <th style={{ width: "100px" }}>Thời hạn</th>
                            <th style={{ width: "142px" }}>Trạng Thái</th>
                            <th style={{ width: "134px" }}>Chế độ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: "center" }}>
                                Bạn chưa có lịch sử thuê phòng nào.
                              </td>
                            </tr>
                          ) : (
                            tableData.map((item) => (
                              <tr key={item.id} className="odd">
                                <td>
                                  <a
                                    href={`/rental-home/` + item.room?.id}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {item.room?.title}
                                  </a>
                                </td>
                                <td>{item.nameOfRent}</td>
                                <td>{item.phone}</td>
                                <td>
                                  {item.room?.price &&
                                    item.room.price.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                </td>
                                <td>
                                  {calculateRemainingMonths(
                                    item.deadlineContract,
                                  )}{" "}
                                  tháng
                                </td>
                                <td style={{ color: "green" }}>
                                  {item.room?.status === "ROOM_RENT" ||
                                  item.room?.status === "CHECKED_OUT"
                                    ? "Đã trả phòng"
                                    : "Đã thuê"}
                                </td>
                                <td>
                                  {item.room?.status === "CHECKED_OUT" ? (
                                    <span style={{ color: "red" }}>
                                      Vô hiệu hóa
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-outline-success"
                                      onClick={() => handleSendRequest(item.id)}
                                    >
                                      Gửi yêu cầu
                                    </button>
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
        </div>
      </main>
      <Footer />
    </>
  );
}

export default RoomHired;
