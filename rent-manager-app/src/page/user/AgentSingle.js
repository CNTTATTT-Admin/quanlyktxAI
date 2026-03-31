import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { toast } from "react-toastify";
import Pagination from "./Pagnation";
import {
  checkFollow,
  followAgents,
  getAccountById,
  getAllrRoomByUserId,
} from "../../services/fetch/ApiUtils";
// BƯỚC 1: Import thêm useNavigate
import { Link, useParams, useNavigate } from "react-router-dom"; 
import { API_BASE_URL } from "../../constants/Connect";

const AgentSingle = (props) => {
  const { id } = useParams();
  const navigate = useNavigate(); // Khởi tạo điều hướng
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

  const handleFollowAgents = () => {
    const followRequest = { rentalerId: id };
    followAgents(followRequest)
      .then((response) => {
        toast.success(response.message);
        setIsFollowing(true);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) || "Vui lòng đăng nhập để theo dõi.",
        );
      });
  };

  // BƯỚC 3: HÀM XỬ LÝ CHUYỂN HƯỚNG SANG TRANG NHẮN TIN
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
      <main id="main" className="bg-light pb-5">
        {/* HEADER & BREADCRUMB */}
        <section className="intro-single pt-5 mt-5 pb-4">
          <div className="container mt-4">
            <div className="row align-items-center">
              <div className="col-md-12 col-lg-8">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold mb-2">{rentaler?.name}</h1>
                  <span className="color-text-a text-muted fs-6">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    Quản lý / Người cho thuê
                  </span>
                </div>
              </div>
              <div className="col-md-12 col-lg-4">
                <nav
                  aria-label="breadcrumb"
                  className="breadcrumb-box d-flex justify-content-lg-end"
                >
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/" className="text-decoration-none text-success">Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/angent-gird" className="text-decoration-none text-success">Người cho thuê</Link>
                    </li>
                    <li className="breadcrumb-item active text-muted" aria-current="page">
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

                    {/* BƯỚC 4: RÁP NÚT NHẮN TIN VÀO GIAO DIỆN */}
                    <div className="d-flex align-items-center justify-content-between mt-4">
                      
                      <div className="d-flex gap-2">
                        {props.currentUser?.id !== parseInt(id) && (
                          <button
                            type="button"
                            onClick={() => handleFollowAgents()}
                            className={`btn ${isFollowing ? "btn-success" : "btn-outline-success"} rounded-pill px-4 fw-bold shadow-sm`}
                            disabled={isFollowing}
                          >
                            {isFollowing ? (
                              <><i className="bi bi-check2-circle me-1"></i> Đã theo dõi</>
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

                      {/* Mạng xã hội */}
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
                <div className="title-box-d">
                  <h3 className="title-d fw-bold">Phòng đang quản lý ({totalItems})</h3>
                </div>
              </div>
            </div>
            
            <div className="row g-4 mb-4">
              {tableData.length > 0 ? (
                tableData.map((room) => (
                  <div className="col-md-4" key={room.id}>
                    <div className="card-box-a card-shadow rounded-4 overflow-hidden h-100 border-0">
                      <div className="img-box-a">
                        {room.roomMedia && room.roomMedia[0] ? (
                          <img
                            src={
                              API_BASE_URL +
                              "/document/" +
                              room.roomMedia[0].files
                            }
                            alt={room.title}
                            className="img-a img-fluid"
                            style={{ width: "100%", height: "450px", objectFit: "cover" }}
                          />
                        ) : (
                          <img
                            src="../../assets/img/property-1.jpg"
                            alt={room.title}
                            className="img-a img-fluid"
                            style={{ width: "100%", height: "450px", objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div className="card-overlay">
                        <div className="card-overlay-a-content">
                          <div className="card-header-a">
                            <h2 className="card-title-a">
                              <Link to={`/rental-home/${room.id}`}>
                                <b>{room.title}</b>
                                <br /> <small>{room.description}</small>
                              </Link>
                            </h2>
                          </div>
                          <div className="card-body-a">
                            <div className="price-box d-flex">
                              <span className="price-a">
                                {room.status === "ROOM_RENT" &&
                                  `Cho thuê |  ${room.price.toLocaleString(
                                    "vi-VN",
                                    {
                                      style: "currency",
                                      currency: "VND",
                                    },
                                  )}`}
                                {room.status === "HIRED" &&
                                  `Đã thuê | ${room.price.toLocaleString(
                                    "vi-VN",
                                    {
                                      style: "currency",
                                      currency: "VND",
                                    },
                                  )}`}
                                {room.status === "CHECKED_OUT" &&
                                  `Đã trả phòng | ${room.price.toLocaleString(
                                    "vi-VN",
                                    {
                                      style: "currency",
                                      currency: "VND",
                                    },
                                  )}`}
                              </span>
                            </div>
                            <Link to={`/rental-home/${room.id}`} style={{ color: "#fff" }}>
                              Xem chi tiết
                              <span className="bi bi-chevron-right"></span>
                            </Link>
                          </div>
                          <div className="card-footer-a">
                            <ul className="card-info d-flex justify-content-around">
                              <li>
                                <h4 className="card-info-title">Vị trí</h4>
                                <span>
                                  {room.location?.cityName}
                                  <sup></sup>
                                </span>
                              </li>
                              <li>
                                <h4 className="card-info-title">Loại</h4>
                                <span>{room.category?.name}</span>
                              </li>
                              <li>
                                <h4 className="card-info-title">
                                  Người cho thuê
                                </h4>
                                <span>{room.user?.name}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <h5 className="text-muted">Người này chưa có phòng nào được đăng.</h5>
                </div>
              )}
            </div>

            {totalItems > itemsPerPage && (
              <div className="row mt-4">
                <div className="col-sm-12 d-flex justify-content-center">
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