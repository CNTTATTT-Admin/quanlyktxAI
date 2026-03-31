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
      <Header
        authenticated={props.authenticated}
        currentUser={props.currentUser}
        onLogout={props.onLogout}
      />
      <main id="main">
        <section className="intro-single pt-5 mt-5">
          <div className="container mt-4">
            <div className="row align-items-center">
              <div className="col-md-12 col-lg-8">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold">PHÒNG KÝ TÚC XÁ</h1>
                  <span className="color-text-a text-muted">
                    Cho thuê phòng ký túc xá
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
                      <a href="/" className="text-decoration-none text-success">Trang chủ</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Phòng Ký Túc Xá
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <section className="property-grid grid py-5 bg-light">
          <div className="container">
            <div className="row mb-5 justify-content-center">
              <div className="col-lg-10">
                <div className="bg-white p-4 rounded-4 shadow-sm border">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-muted fw-bold small">Tên phòng</label>
                      <input
                        type="text"
                        className="form-control form-control-lg bg-light border-0"
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
                        className="form-control form-control-lg bg-light border-0"
                        name="price"
                        value={price}
                        onChange={handlePriceChange}
                        placeholder="VD: 1500000"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted fw-bold small">Loại phòng</label>
                      <select
                        className="form-select form-select-lg bg-light border-0"
                        id="categoryId"
                        name="categoryId"
                        value={cateId}
                        onChange={handleCategoryChange}
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
                          alt=""
                          className="img-a img-fluid"
                          style={{ width: "350px", height: "450px" }}
                        />
                      ) : (
                        <img
                          src="assets/img/property-1.jpg"
                          alt=""
                          className="img-a img-fluid"
                          style={{ width: "350px", height: "450px" }}
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
                              {room.status === "AVAILABLE" && "Trống | "}
                              {room.status === "PARTIALLY_FILLED" &&
                                "Còn chỗ | "}
                              {room.status === "FULL" && "Đã đầy | "}
                              {room.status === "MAINTENANCE" && "Bảo trì | "}
                              {[
                                "ROOM_RENT",
                                "AVAILABLE",
                                "PARTIALLY_FILLED",
                                "CHECKED_OUT",
                              ].includes(room.status) === false &&
                                room.status !== "FULL" &&
                                room.status !== "MAINTENANCE" &&
                                "Đã thuê | "}
                              {room.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </span>
                          </div>
                          <Link
                            to={`/rental-home/${room.id}`}
                            style={{ color: "#fff" }}
                          >
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
              ))}
            </div>

            <div className="d-flex justify-content-center mt-4">
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