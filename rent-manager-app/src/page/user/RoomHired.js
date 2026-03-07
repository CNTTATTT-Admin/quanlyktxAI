import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import {
  getAllRoomHired,
  createCheckoutRequest,
} from "../../services/fetch/ApiUtils";
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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [reason, setReason] = useState("");

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

  const handleOpenModal = (roomId) => {
    setSelectedRoomId(roomId);
    setReason("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoomId(null);
    setReason("");
  };

  const submitLeaveRequest = () => {
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do rời phòng.");
      return;
    }
    createCheckoutRequest({
      roomId: selectedRoomId,
      reason: reason,
    })
      .then((res) => {
        toast.success(
          res?.message || "Đã gửi yêu cầu rời phòng, vui lòng chờ duyệt.",
        );
        handleCloseModal();
        fetchData(); // reload
      })
      .catch((err) => {
        toast.error((err && err.message) || "Gửi yêu cầu thất bại.");
      });
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
                            <th style={{ width: "200px" }}>Bạn cùng phòng</th>
                            <th style={{ width: "142px" }}>Trạng Thái</th>
                            <th style={{ width: "100px" }}>Hành động</th>
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
                                <td>
                                  {item.room?.residents &&
                                  item.room.residents.length > 1 ? (
                                    <ul className="list-unstyled mb-0">
                                      {item.room.residents
                                        .filter((r) => r.id !== currentUser?.id)
                                        .map((r) => (
                                          <li
                                            key={r.id}
                                            style={{ fontSize: "0.85rem" }}
                                          >
                                            • {r.name} ({r.phone})
                                          </li>
                                        ))}
                                    </ul>
                                  ) : (
                                    <span className="text-muted">Chưa có</span>
                                  )}
                                </td>
                                <td
                                  style={{
                                    color:
                                      item.room?.status === "CHECKED_OUT"
                                        ? "red"
                                        : "green",
                                  }}
                                >
                                  {item.room?.status === "CHECKED_OUT"
                                    ? "Đã trả phòng"
                                    : "Đang ở"}
                                </td>
                                <td>
                                  {item.room?.status !== "CHECKED_OUT" && (
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() =>
                                        handleOpenModal(item.room?.id)
                                      }
                                    >
                                      Yêu cầu rời
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

      {showModal && (
        <div
          className="modal show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Yêu cầu trả phòng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Lý do rời phòng</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập lý do chi tiết..."
                      required
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={submitLeaveRequest}
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default RoomHired;
