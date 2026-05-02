import React, { useEffect, useState, useCallback } from "react";
import SidebarNav from "./SidebarNav";
import Nav from "./Nav";
import {
  disableRoom,
  getAllRoomOfRentaler,
} from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import ModalRoomDetails from "./modal/ModalRoomDetail";
import useAutoReload from "../../hooks/useAutoReload";
import { formatVnd } from "../../utils/currency";

function RoomManagement(props) {
  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [roomId, setRoomId] = useState(4);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(() => {
    getAllRoomOfRentaler(currentPage, itemsPerPage, searchQuery)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
    }, [currentPage, itemsPerPage, searchQuery]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    useAutoReload({ enabled: authenticated, onReload: fetchData });

    const notifyDataUpdated = () => {
      localStorage.setItem("app-data-updated-at", String(Date.now()));
      window.dispatchEvent(new Event("app-data-updated"));
    };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRedirectAddRoom = () => {
    history("/rentaler/add-room");
  };

  const handleEditRoom = (id) => {
    history("/rentaler/edit-room/" + id);
  };

  const handleSetRoomId = (id) => {
    setRoomId(id);
    setShowModal(true);
  };

  const handleDisableRoom = (roomId) => {
    disableRoom(roomId)
      .then((response) => {
        toast.success(response.message);
        notifyDataUpdated();
        fetchData();
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

  console.log("ROOM_ID", roomId);

  if (!props.authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login-rentaler",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        .eco-bg { background-color: #F8FAFC; min-height: 100vh; }
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modern-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15) !important; }
        .img-hover-zoom { overflow: hidden; border-radius: 16px; }
        .img-hover-zoom img { transition: transform 0.6s ease; }
        .modern-card:hover .img-hover-zoom img { transform: scale(1.05); }
        
        .btn-modern { transition: all 0.3s ease; border-radius: 50px; font-weight: 600; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; }
        
        .search-modern { border-radius: 50px; padding: 12px 20px; border: 1px solid #e2e8f0; transition: all 0.3s; }
        .search-modern:focus { outline: none; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); background: #fff; }
      `}</style>

      <div className="container-fluid p-4 eco-bg">
        <div className="row mb-4 align-items-center">
          <div className="col-md-8">
            <h2 className="fw-bolder text-dark mb-1">Quản lý phòng KTX</h2>
            <p className="text-muted mb-0">Quản lý thật tốt các chức năng của phòng KTX.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button className="btn bg-emerald text-white btn-modern px-4 py-2 shadow-sm" onClick={handleRedirectAddRoom}>
              <i className="bi bi-plus-circle me-2"></i> Thêm Phòng
            </button>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-md-6 col-lg-4">
            <div className="position-relative shadow-sm rounded-pill">
              <input
                type="text"
                className="form-control search-modern w-100 pe-5"
                placeholder="Tìm kiếm tên phòng..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-4 text-muted"></i>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {tableData.length > 0 ? (
            tableData.map((item) => (
              <div className="col-12 col-xl-6" key={item.id}>
                <div className="card h-100 border-0 shadow-sm p-3 d-flex flex-column modern-card" style={{ borderRadius: "20px" }}>
                  
                  <div className="position-relative img-hover-zoom mb-3">
                    <span 
                      className="badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-3 shadow-sm"
                      style={{ backgroundColor: "#10B981", fontSize: "0.85rem", zIndex: 2 }}
                    >
                      {item.status === "AVAILABLE" && "Trống"}
                      {item.status === "PARTIALLY_FILLED" && "Còn chỗ"}
                      {item.status === "FULL" && "Hết chỗ"}
                      {item.status === "MAINTENANCE" && "Bảo trì"}
                      {item.status === "ROOM_RENT" && "Còn chỗ"}
                      {item.status === "HIRED" && "Hết chỗ"}
                      {item.status === "CHECKED_OUT" && "Bảo trì"}
                    </span>

                    <span 
                      className={`badge position-absolute top-0 end-0 m-3 px-3 py-2 rounded-3 shadow-sm ${item.isApprove ? 'bg-primary' : 'bg-warning text-dark'}`}
                      style={{ zIndex: 2 }}
                    >
                      {item.isApprove ? "Đã duyệt" : "Chưa duyệt"}
                    </span>

                    <img
                      src={item.roomMedia && item.roomMedia[0] ? `http://localhost:8080/document/${item.roomMedia[0].files}` : "/assets/img/property-1.jpg"}
                      alt={item.title}
                      className="card-img-top object-fit-cover w-100"
                      style={{ height: "240px", borderRadius: "12px" }}
                    />
                  </div>
                  
                  <div className="card-body p-0 d-flex flex-column flex-grow-1">
                    <h4 className="fw-bold text-dark text-truncate mb-3">{item.title}</h4>
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      
                      <div className="d-flex flex-column gap-1" style={{ maxWidth: "55%" }}>
                        <h5 className="fw-bolder text-emerald mb-0" style={{ fontSize: "1.3rem" }}>
                          {formatVnd(item.price)} <span className="text-muted fw-normal small" style={{ fontSize: "0.9rem" }}>/tháng</span>
                        </h5>
                        <div className="text-muted small text-truncate mt-1" title={item.location?.cityName}>
                          <i className="bi bi-geo-alt-fill text-emerald me-1"></i> {item.location?.cityName}
                        </div>
                      </div>

                      <div className="d-flex flex-column align-items-end gap-1" style={{ maxWidth: "45%" }}>
                        <div className="text-dark small fw-medium">
                          <i className="bi bi-people-fill text-emerald me-1"></i> Tối đa {item.maxOccupancy}
                        </div>
                        <div className="text-dark small fw-medium">
                          <i className="bi bi-layers-fill text-emerald me-1"></i> Tầng {item.floor}
                        </div>
                        <div className={`mt-1 border rounded-pill px-2 py-1 fw-bold ${item.isLocked === 'ENABLE' ? 'bg-light text-success border-success' : 'bg-light text-danger border-danger'}`} style={{ fontSize: "0.75rem" }}>
                          {item.isLocked === "ENABLE" ? "Đang hiển thị" : "Đang ẩn"}
                        </div>
                      </div>

                    </div>

                    <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                      {item.isRemove === true ? (
                        <span className="text-danger fw-bold small">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i> Admin đã gỡ tin
                        </span>
                      ) : (
                        <div className="d-flex gap-2 w-100">
                          <button 
                            className="btn btn-light text-primary flex-grow-1 btn-modern border shadow-sm" 
                            onClick={() => handleEditRoom(item.id)} 
                            title="Sửa thông tin"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Sửa
                          </button>
                          
                          <button 
                            className="btn btn-light text-info flex-grow-1 btn-modern border shadow-sm" 
                            onClick={() => handleSetRoomId(item.id)} 
                            data-bs-toggle="modal" 
                            data-bs-target=".bd-example-modal-lg" 
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye me-1"></i> Xem
                          </button>

                          <button 
                            className="btn btn-light text-danger flex-grow-1 btn-modern border shadow-sm" 
                            onClick={() => handleDisableRoom(item.id)} 
                            title="Ẩn/Hiện phòng"
                          >
                            <i className="bi bi-eye-slash me-1"></i> Ẩn
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <h5 className="text-muted fw-semibold">Không tìm thấy phòng nào.</h5>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-center mt-4">
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            currentPage={currentPage}
            paginate={paginate}
          />
        </div>

        <div
          className="modal fade bd-example-modal-lg"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark fs-4" id="exampleModalLabel">
                  Chi tiết bài đăng tin
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body overflow-auto p-4">
                {showModal && <ModalRoomDetails roomId={roomId} />}
              </div>
              <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                <button
                  type="button"
                  className="btn btn-light btn-modern fw-bold px-4"
                  data-bs-dismiss="modal"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoomManagement;