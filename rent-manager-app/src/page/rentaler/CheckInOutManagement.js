import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import { getCheckInOutHistoryByRentaler, getAllRoomOfRentaler } from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";

const CheckInOutManagement = (props) => {
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { currentUser, onLogout } = props;

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedRoomId]);

  const fetchRooms = () => {
    getAllRoomOfRentaler(0, 100, "")
      .then((response) => {
        setRooms(response.content);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  };

  const fetchLogs = () => {
    getCheckInOutHistoryByRentaler(currentPage, pageSize, selectedRoomId)
      .then((response) => {
        setLogs(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error("Lỗi khi tải lịch sử điểm danh.");
      });
  };

  const handleRoomChange = (e) => {
    setSelectedRoomId(e.target.value);
    setCurrentPage(0);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber - 1);
  };

  return (
    <div className="container-fluid p-0">
      <h1 className="h3 mb-3">Lịch sử điểm danh (Face ID)</h1>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Lọc theo phòng:</label>
                  <select
                    className="form-select"
                    value={selectedRoomId}
                    onChange={handleRoomChange}
                  >
                    <option value="">Tất cả phòng</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              <table className="table table-hover my-0">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Phòng</th>
                    <th>Loại</th>
                    <th>Thời gian</th>
                    <th>Độ tin cậy</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.userName}</td>
                      <td>{log.userEmail}</td>
                      <td>{log.roomTitle || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            log.checkType === "CHECK_IN"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {log.checkType}
                        </span>
                      </td>
                      <td>{new Date(log.checkTime).toLocaleString()}</td>
                      <td>{(log.confidence * 100).toFixed(1)}%</td>
                      <td>
                        {log.success ? (
                          <span className="text-success">Thành công</span>
                        ) : (
                          <span className="text-danger">Thất bại</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <Pagination
                itemsPerPage={pageSize}
                totalItems={totalItems}
                currentPage={currentPage + 1}
                paginate={paginate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutManagement;
