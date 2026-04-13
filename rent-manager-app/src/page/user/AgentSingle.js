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
                          <a href={rentaler.facebookUrl} className="btn btn-outline-primary rounded-circle shadow-sm" target="_blank" rel="noopener noreferrer" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-facebook fs-5"></i>
                          </a>
                        )}
                        {rentaler?.zaloUrl && (
                          <a
                            href={rentaler.zaloUrl}
                            className="btn btn-outline-info rounded-circle shadow-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              fill="currentColor"
                              className="fs-5"
                              viewBox="0 0 50 50"
                            >
                              <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z"></path>
                            </svg>
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