import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarNav from "./SidebarNav";
import {
  reportMaintenance,
  getMaintenanceHistoryForUser,
  getRoom,
} from "../../services/fetch/ApiUtils";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Pagination from "./Pagnation";

function MaintenanceUserPage(props) {
  const { authenticated, currentUser, location, onLogout } = props;

  const [maintenanceData, setMaintenanceData] = useState({
    roomId: "",
    description: "",
    files: [],
  });

  const [tableData, setTableData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (authenticated) {
      fetchUserRooms();
      fetchMaintenanceHistory();
    }
  }, [currentPage, authenticated]);

  const fetchUserRooms = () => {
    const allocatedRoomId = currentUser?.allocatedRoomId;
    if (!allocatedRoomId) {
      setRooms([]);
      return;
    }
    getRoom(allocatedRoomId)
      .then((room) => {
        setRooms([room]);
        setMaintenanceData((prev) => ({
          ...prev,
          roomId: room.id,
        }));
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải thông tin phòng.",
        );
      });
  };

  const fetchMaintenanceHistory = () => {
    getMaintenanceHistoryForUser(currentPage, itemsPerPage)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Không thể tải lịch sử bảo trì.",
        );
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMaintenanceData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    setMaintenanceData((prevState) => ({
      ...prevState,
      files: [...event.target.files],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!maintenanceData.roomId) {
      toast.warning("Vui lòng chọn phòng cần bảo trì.");
      return;
    }

    reportMaintenance(maintenanceData)
      .then((response) => {
        toast.success("Gửi yêu cầu bảo trì thành công!");
        setMaintenanceData({
          roomId: rooms.length === 1 ? rooms[0].id : "",
          description: "",
          files: [],
        });
        fetchMaintenanceHistory();
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return <span className="badge bg-success">Đã hoàn thành</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-primary">Đang thực hiện</span>;
      default:
        return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
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
                      <h5 className="card-title">Yêu cầu bảo trì</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Phòng bảo trì</label>
                          {rooms.length === 1 ? (
                            <input
                              type="text"
                              className="form-control"
                              value={rooms[0].title}
                              readOnly
                            />
                          ) : rooms.length > 1 ? (
                            <select
                              className="form-select"
                              name="roomId"
                              value={maintenanceData.roomId}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Chọn phòng...</option>
                              {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                  {room.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div
                              className="alert alert-warning p-2 mb-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Bạn chưa có hợp đồng thuê phòng nào để báo cáo bảo
                              trì.
                            </div>
                          )}
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mô tả lỗi</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            name="description"
                            value={maintenanceData.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả chi tiết vấn đề cần bảo trì..."
                            required
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Hình ảnh/Tài liệu (nếu có)
                          </label>
                          <input
                            className="form-control"
                            type="file"
                            name="files"
                            onChange={handleFileChange}
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={rooms.length === 0}
                        >
                          Gửi yêu cầu
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-xl-8">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">Lịch sử bảo trì</h5>
                    </div>
                    <div className="card-body">
                      <table
                        className="table table-striped"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <th>Phòng</th>
                            <th>Mô tả</th>
                            <th>Ngày yêu cầu</th>
                            <th>Trạng thái</th>
                            <th>Chi phí</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center">
                                Chưa có yêu cầu bảo trì nào.
                              </td>
                            </tr>
                          ) : (
                            tableData.map((item) => (
                              <tr key={item.id}>
                                <td>{item.room.title}</td>
                                <td>{item.description}</td>
                                <td>
                                  {item.createdAt
                                    ? new Date(
                                        item.createdAt,
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </td>
                                <td>{getStatusBadge(item.status)}</td>
                                <td>
                                  {item.price
                                    ? item.price.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      })
                                    : "-"}
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

export default MaintenanceUserPage;
