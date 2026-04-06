import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { toast } from "react-toastify";
import Pagination from "./Pagnation";
import {
  checkFollow,
  followAgents,
  unfollowAgents,
  getAccountById,
  getAllrRoomByUserId,
} from "../../services/fetch/ApiUtils";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/Connect";

const AgentSingle = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, settableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rentaler, setRentaler] = useState({
    name: "",
    email: "",
    imageUrl: "",
    phone: "",
    address: "",
    zaloUrl: "",
    facebookUrl: "",
  });
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id, currentPage, searchQuery]);

  const fetchData = () => {
    getAllrRoomByUserId(currentPage, itemsPerPage, id)
      .then((response) => {
        settableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });

    getAccountById(id)
      .then((response) => {
        const contract = response;
        setRentaler((prevState) => ({
          ...prevState,
          ...contract,
        }));
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });

    if (props.authenticated) {
      checkFollow(id)
        .then((response) => {
          setIsFollowing(response);
        })
        .catch((error) => {
          console.error("Error checking follow status:", error);
        });
    }
  };

  const handleToggleFollow = () => {
    if (!props.authenticated) {
      toast.warning("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }

    if (isFollowing) {
      unfollowAgents(id)
        .then((response) => {
          toast.success(response.message || "Đã hủy theo dõi chủ trọ.");
          setIsFollowing(false);
        })
        .catch((error) => {
          toast.error((error && error.message) || "Có lỗi xảy ra khi hủy theo dõi.");
        });
    } else {
      const followRequest = { rentalerId: id };
      followAgents(followRequest)
        .then((response) => {
          toast.success(response.message || "Đã theo dõi thành công.");
          setIsFollowing(true);
        })
        .catch((error) => {
          toast.error((error && error.message) || "Có lỗi xảy ra khi theo dõi.");
        });
    }
  };

  const handleStartChat = () => {
    if (!props.authenticated || !props.currentUser) {
      toast.warning("Vui lòng đăng nhập để nhắn tin với Chủ trọ!");
      navigate("/login");
      return;
    }

    navigate("/message", {
      state: {
        targetRentaler: { id: parseInt(id), name: rentaler.name }
      }
    });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Header
        authenticated={props.authenticated}
        currentUser={props.currentUser}
        onLogout={props.onLogout}
      />
      
      <style>{`
        .modern-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modern-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15) !important; }
        .img-hover-zoom { overflow: hidden; border-radius: 16px; }
        .img-hover-zoom img { transition: transform 0.6s ease; }
        .modern-card:hover .img-hover-zoom img { transform: scale(1.08); }
        .btn-modern { transition: all 0.3s ease; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3) !important; }
        .tag-hover { transition: all 0.3s ease; cursor: default; }
        .tag-hover:hover { background-color: #D1FAE5 !important; border-color: #10B981 !important; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1); }
        .icon-hover i { transition: all 0.3s ease; cursor: pointer; }
        .icon-hover i:hover { color: #10B981 !important; transform: scale(1.2) rotate(5deg); }
      `}</style>

      <main id="main" style={{ backgroundColor: "#F0FDF4", minHeight: "100vh" }} className="pt-5 mt-4 pb-5">
        <section className="intro-single pt-5 pb-2">
          <div className="container mt-4">
            <div className="row align-items-center">
              <div className="col-md-12 col-lg-6">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold text-dark" style={{ fontSize: "2.2rem" }}>{rentaler?.name}</h1>
                  <span className="text-muted fw-semibold mt-2 d-block">
                    Quản lý / Người cho thuê
                  </span>
                </div>
              </div>

              <div className="col-md-12 col-lg-6 d-flex justify-content-lg-end mt-4 mt-lg-0">
                <nav aria-label="breadcrumb" className="breadcrumb-box bg-white px-4 py-2 rounded-pill shadow-sm border">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/" className="text-decoration-none fw-semibold" style={{ color: "#10B981" }}>Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item active text-muted fw-semibold">
                      <Link to="/angent-gird" className="text-decoration-none text-success">Người cho thuê</Link>
                    </li>
                    <li className="breadcrumb-item active text-muted fw-semibold">
                      Chi tiết
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <section className="agent-single">
          <div className="container">
            {/* THÔNG TIN CHỦ NHÀ */}
            <div className="bg-white p-4 rounded-4 shadow-sm border border-light mb-5">
              <div className="row align-items-center g-4">
                <div className="col-md-5 col-lg-4 text-center">
                  <img
                    src={rentaler?.imageUrl || "../../assets/img/agent-4.jpg"}
                    alt={rentaler?.name}
                    className="img-fluid rounded-4 shadow-sm border border-3 border-white"
                    style={{ height: "350px", width: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-7 col-lg-8 px-md-4">
                  <div className="agent-info-box">
                    <h2 className="fw-bold mb-3">{rentaler?.name}</h2>
                    <p className="text-muted mb-4">
                      Cam kết mang đến không gian sống an toàn, sạch sẽ và tiện nghi nhất cho sinh viên.
                      Luôn hỗ trợ nhiệt tình 24/7.
                    </p>

                    <ul className="list-unstyled mb-4 bg-light p-3 rounded-4 border">
                      <li className="d-flex align-items-start mb-3">
                        <i className="bi bi-geo-alt-fill text-success fs-5 me-3 mt-1"></i>
                        <div>
                          <strong className="d-block text-dark">Địa chỉ</strong>
                          <span className="text-muted">{rentaler?.address || "Chưa được cập nhật"}</span>
                        </div>
                      </li>
                      <li className="d-flex align-items-center mb-3">
                        <i className="bi bi-telephone-fill text-success fs-5 me-3"></i>
                        <div>
                          <strong className="d-block text-dark">Số điện thoại</strong>
                          <span className="text-muted">{rentaler?.phone || "Chưa cập nhật"}</span>
                        </div>
                      </li>
                      <li className="d-flex align-items-center">
                        <i className="bi bi-envelope-fill text-success fs-5 me-3"></i>
                        <div>
                          <strong className="d-block text-dark">Email</strong>
                          <span className="text-muted">{rentaler?.email || "Chưa cập nhật"}</span>
                        </div>
                      </li>
                    </ul>

                    <div className="d-flex align-items-center justify-content-between mt-4">
                      <div className="d-flex gap-2">
                        {props.currentUser?.id !== parseInt(id) && (
                          <button
                            type="button"
                            onClick={handleToggleFollow} // Gọi hàm bật tắt
                            className={`btn ${isFollowing ? "btn-outline-secondary text-dark" : "btn-outline-success"} rounded-pill px-4 fw-bold shadow-sm`}
                            // Đã xóa thuộc tính disabled để cho phép bấm lại
                          >
                            {isFollowing ? (
                              <><i className="bi bi-person-dash-fill me-1"></i> Hủy theo dõi</>
                            ) : (
                              <><i className="bi bi-person-plus-fill me-1"></i> Theo dõi</>
                            )}
                          </button>
                        )}

                        {props.currentUser?.id !== parseInt(id) && (
                          <button
                            type="button"
                            onClick={handleStartChat}
                            className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                          >
                            <i className="bi bi-chat-text-fill me-1"></i> Nhắn tin
                          </button>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        {rentaler?.facebookUrl && (
                          <a href={rentaler.facebookUrl} className="btn btn-outline-primary rounded-circle" target="_blank" rel="noopener noreferrer" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-facebook fs-5"></i>
                          </a>
                        )}
                        {rentaler?.zaloUrl && (
                          <a href={rentaler.zaloUrl} className="btn btn-outline-info rounded-circle" target="_blank" rel="noopener noreferrer" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-chat-dots-fill fs-5"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-12">
                <div className="title-box-d border-bottom pb-3">
                  <h3 className="title-d fw-bold text-dark m-0">Phòng đang quản lý ({totalItems})</h3>
                </div>
              </div>
            </div>

            {/* DANH SÁCH PHÒNG */}
            <div className="row g-4 mb-4">
              {tableData.length > 0 ? (
                tableData.map((room) => (
                  <div className="col-md-6 col-lg-4" key={room.id}>
                    <div className="card h-100 border-0 shadow-sm p-2 d-flex flex-column modern-card" style={{ borderRadius: "20px" }}>
                      
                      <div className="position-relative img-hover-zoom">
                        <span 
                          className="badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-3 shadow-sm"
                          style={{ backgroundColor: "#10B981", fontSize: "0.85rem", zIndex: 2 }}
                        >
                          {room.status === "AVAILABLE" && "Mới"}
                          {room.status === "PARTIALLY_FILLED" && "Còn chỗ"}
                          {room.status === "FULL" && "Đã đầy"}
                          {room.status === "MAINTENANCE" && "Bảo trì"}
                          {["ROOM_RENT", "AVAILABLE", "PARTIALLY_FILLED", "CHECKED_OUT"].includes(room.status) === false &&
                            room.status !== "FULL" && room.status !== "MAINTENANCE" && "Đã thuê"}
                        </span>
                        
                        <span 
                          className="badge bg-white text-dark position-absolute top-0 end-0 m-3 px-3 py-2 rounded-3 shadow-sm fw-bold"
                          style={{ zIndex: 2 }}
                        >
                          <i className="bi bi-bounding-box me-1 text-muted"></i> 30 m²
                        </span>

                        {room.roomMedia && room.roomMedia[0] ? (
                          <img
                            src={API_BASE_URL + "/document/" + room.roomMedia[0].files}
                            alt={room.title}
                            className="card-img-top object-fit-cover"
                            style={{ height: "230px", borderRadius: "16px" }}
                          />
                        ) : (
                          <img
                            src="../../assets/img/property-1.jpg"
                            alt="Mặc định"
                            className="card-img-top object-fit-cover"
                            style={{ height: "230px", borderRadius: "16px" }}
                          />
                        )}
                      </div>
                      
                      <div className="card-body px-3 pt-3 pb-2 d-flex flex-column flex-grow-1">
                        <h4 className="card-title fw-bold text-dark mb-1 text-truncate" title={room.title} style={{ transition: "color 0.3s" }} onMouseOver={(e) => e.target.style.color = '#10B981'} onMouseOut={(e) => e.target.style.color = '#212529'}>
                          {room.title}
                        </h4>
                        
                        <h5 className="fw-bold mb-2" style={{ color: "#10B981" }}>
                          {room.price.toLocaleString("vi-VN")} VNĐ <span className="text-muted fw-normal small">/ tháng</span>
                        </h5>
                        
                        <p className="card-text text-muted small mb-3 text-truncate">
                          {room.description || "Thoáng mát, có ban công phơi đồ, vệ sinh khép kín..."}
                        </p>

                        <div className="d-flex flex-wrap gap-2 mb-4 mt-auto">
                          <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-2 text-dark tag-hover" title="Vị trí">
                            <i className="bi bi-geo-alt-fill me-2" style={{ color: "#10B981", fontSize: "1.1rem" }}></i> 
                            <span className="fw-bold" style={{ fontSize: "0.95rem" }}>{room.location?.cityName || room.location?.name || "Chưa có"}</span>
                          </div>
                          
                          <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-2 text-dark tag-hover" title="Loại phòng">
                            <i className="bi bi-tags-fill me-2" style={{ color: "#10B981", fontSize: "1.1rem" }}></i> 
                            <span className="fw-bold" style={{ fontSize: "0.95rem" }}>{room.category?.name || "Chưa có"}</span>
                          </div>
                          
                          <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-2 text-dark tag-hover" title="Chủ trọ">
                            <i className="bi bi-person-circle me-2" style={{ color: "#10B981", fontSize: "1.1rem" }}></i> 
                            <span className="fw-bold" style={{ fontSize: "0.95rem" }}>{room.user?.name || "Chưa có tên"}</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                          <div className="d-flex gap-3 text-muted icon-hover">
                            <i className="bi bi-wifi fs-5" title="Có Wifi"></i>
                            <i className="bi bi-snow fs-5" title="Có Điều hòa"></i>
                            <i className="bi bi-shield-check fs-5" title="An ninh tốt"></i>
                          </div>
                          <Link 
                            to={`/rental-home/${room.id}`} 
                            className="btn btn-success px-4 py-2 rounded-pill fw-semibold shadow-sm btn-modern" 
                            style={{ backgroundColor: "#10B981", border: "none" }}
                          >
                            Xem chi tiết <i className="bi bi-arrow-right ms-1"></i>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
                  <i className="bi bi-house-x text-muted fs-1 mb-3 d-block opacity-50"></i>
                  <h5 className="text-muted fw-bold">Người này chưa có phòng nào được đăng.</h5>
                </div>
              )}
            </div>

            {totalItems > itemsPerPage && (
              <div className="row mt-4">
                <div className="col-sm-12 d-flex justify-content-center pb-5">
                  <Pagination
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    paginate={paginate}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AgentSingle;