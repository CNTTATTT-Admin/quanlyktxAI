import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "./Pagnation";
import { getAllRoomOfCustomer } from "../../services/fetch/ApiUtils";
import { API_BASE_URL } from "../../constants/Connect";

const RentalHome = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [price, setPrice] = useState("");
  const [cateId, setCateId] = useState(0);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, price, cateId]);

  const fetchData = () => {
    getAllRoomOfCustomer(currentPage, itemsPerPage, searchQuery, price, cateId)
      .then((response) => {
        setRooms(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCateId(event.target.value);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <style>{`
        .modern-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modern-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15) !important; }
        
        .img-hover-zoom { overflow: hidden; border-radius: 16px; }
        .img-hover-zoom img { transition: transform 0.6s ease; }
        .modern-card:hover .img-hover-zoom img { transform: scale(1.08); }
        
        .btn-modern { transition: all 0.3s ease; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3) !important; }
        
        .input-modern { transition: all 0.3s ease; }
        .input-modern:focus { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2) !important; background-color: #ffffff !important; transform: translateY(-2px); }
        
        .tag-hover { transition: all 0.3s ease; cursor: default; }
        .tag-hover:hover { background-color: #D1FAE5 !important; border-color: #10B981 !important; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1); }
        
        .filter-box { transition: all 0.4s ease; }
        .filter-box:hover { box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important; }

        .icon-hover i { transition: all 0.3s ease; cursor: pointer; }
        .icon-hover i:hover { color: #10B981 !important; transform: scale(1.2) rotate(5deg); }
      `}</style>

      <Header
        authenticated={props.authenticated}
        currentUser={props.currentUser}
        onLogout={props.onLogout}
      />
      <main id="main" style={{ backgroundColor: "#F0FDF4", minHeight: "100vh" }}>

        <section className="intro-single pt-5 mt-5 pb-2">
          <div className="container mt-4">
            <div className="row align-items-center">
              
              {/* Cột trái: Tiêu đề */}
              <div className="col-md-12 col-lg-6">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold text-dark" style={{ fontSize: "2.2rem" }}>Tìm phòng trọ</h1>
                  <span className="text-muted fw-semibold mt-2 d-block">
                    Lựa chọn không gian sống phù hợp với bạn.
                  </span>
                </div>
              </div>

              {/* Cột phải: Breadcrumb (Được bọc trong col-lg-6 và căn phải) */}
              <div className="col-md-12 col-lg-6 d-flex justify-content-lg-end mt-4 mt-lg-0">
                <nav aria-label="breadcrumb" className="breadcrumb-box bg-white px-4 py-2 rounded-pill shadow-sm border">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/" className="text-decoration-none fw-semibold" style={{ color: "#10B981" }}>Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item active text-muted fw-semibold" aria-current="page">
                      Phòng Ký Túc Xá
                    </li>
                  </ol>
                </nav>
              </div>

            </div>
          </div>
        </section>

        <section className="property-grid grid py-4">
          <div className="container">

            <div className="row mb-5 justify-content-center">
              <div className="col-lg-12">
                <div className="bg-white p-4 rounded-4 shadow-sm border-0 filter-box">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-muted fw-bold small">Tên phòng</label>
                      <input
                        type="text"
                        className="form-control form-control-lg bg-light border-0 input-modern"
                        name="searchQuery"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Nhập tên phòng..."
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted fw-bold small">Mức giá tối đa</label>
                      <input
                        type="number"
                        className="form-control form-control-lg bg-light border-0 input-modern"
                        name="price"
                        value={price}
                        onChange={handlePriceChange}
                        placeholder="VD: 1500000"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted fw-bold small">Loại phòng</label>
                      <select
                        className="form-select form-select-lg bg-light border-0 input-modern"
                        id="categoryId"
                        name="categoryId"
                        value={cateId}
                        onChange={handleCategoryChange}
                        style={{ cursor: "pointer" }}
                      >
                        <option value={0}>Tất cả các loại...</option>
                        <option value={1}>Kí túc xá nam</option>
                        <option value={2}>Kí túc xá nữ</option>
                        <option value={3}>Kí túc xá dịch vụ</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              {rooms.map((room) => (
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
                          style={{ height: "230px" }}
                        />
                      ) : (
                        <img
                          src="assets/img/property-1.jpg"
                          alt="Mặc định"
                          className="card-img-top object-fit-cover"
                          style={{ height: "230px" }}
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
                          <span className="fw-bold" style={{ fontSize: "0.95rem" }}>{room.location?.cityName || "Chưa có"}</span>
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
              ))}
            </div>

            <div className="d-flex justify-content-center mt-4 pb-4">
              <Pagination
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                currentPage={currentPage}
                paginate={paginate}
              />
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default RentalHome;