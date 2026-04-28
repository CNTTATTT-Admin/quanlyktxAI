import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  getAllAccountRentalerForCustomer,
  getAllRoomOfCustomer,
} from "../services/fetch/ApiUtils";
import { API_BASE_URL } from "../constants/Connect";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { formatVnd } from "../utils/currency";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      totalPages: 3,
      rooms: [],
      sortingOption: "Thời gian: Mới đến cũ",
      rentaler: [],
    };
  }

  componentDidMount() {
    this.fetchRooms(this.state.currentPage);
  }

  fetchRooms = () => {
    getAllRoomOfCustomer(1, 3, "", "", "")
      .then((response) => {
        this.setState({
          rooms: response.content,
        });
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });

    getAllAccountRentalerForCustomer(1, 3)
      .then((response) => {
        this.setState({
          rentaler: (response.content || []).slice(0, 3),
        });
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  render() {
    const { rooms, rentaler } = this.state;

    return (
      <main id="main">
        <style>{`
          .modern-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid transparent !important;
          }
          .modern-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 25px 50px rgba(16, 185, 129, 0.12) !important;
            border-color: rgba(16, 185, 129, 0.2) !important;
          }

          .img-hover-zoom {
            overflow: hidden;
          }
          .img-hover-zoom img {
            transition: transform 0.7s ease;
          }
          .modern-card:hover .img-hover-zoom img {
            transform: scale(1.08);
          }

          .contact-item {
            transition: all 0.3s ease;
            border-radius: 8px;
            padding: 8px 12px;
            margin-left: -12px;
            margin-right: -12px;
            cursor: default;
          }
          .contact-item:hover {
            background-color: #F0FDF4;
            transform: translateX(8px);
          }
          .contact-item:hover .text-muted {
            color: #10B981 !important;
          }

          .btn-modern {
            transition: all 0.3s ease;
          }
          .btn-modern:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3) !important;
          }

          .social-btn-hover {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .social-btn-hover:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 10px 20px rgba(13, 110, 253, 0.2) !important;
          }

          .section-title-modern .title-a {
            font-size: 2.2rem;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
            color: #0d6efd;
          }

          .section-title-modern .title-underline {
            width: 60px;
            height: 3px;
            background-color: #2eca6a;
            margin: 0 auto;
          }

          .services-section-bg {
            background: radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent 55%),
              linear-gradient(135deg, #f6fffb 0%, #fff3e6 100%);
          }

          .services-panel {
            background: linear-gradient(160deg, #ffffff 0%, #f0fffb 55%, #fff6ee 100%);
          }

          .service-hero {
            min-height: 160px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(255, 199, 123, 0.16));
          }

          .service-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
            font-weight: 700;
            border: 1px solid rgba(16, 185, 129, 0.18);
          }

          .service-title {
            font-size: 1.2rem;
            line-height: 1.35;
          }

          .service-description {
            font-size: 0.98rem;
            line-height: 1.75;
          }

          .section-testimonials-modern {
            min-height: 820px;
          }

          .testimonial-card-modern {
            background: linear-gradient(180deg, #ffffff 0%, #fbfffd 100%);
          }

          .testimonial-hero {
            min-height: 300px;
            background: linear-gradient(135deg, rgba(46,202,106,0.12), rgba(255,255,255,0.7));
          }

          .testimonial-title-modern {
            font-size: 2.2rem;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
          }

          .testimonial-underline {
            width: 60px;
            height: 3px;
            background-color: #2eca6a;
            margin: 0 auto;
          }

          .testimonials-box .testimonial-text {
            font-size: 1.15rem;
            line-height: 1.9;
          }

          .testimonial-author {
            font-size: 1.05rem;
          }

          .intro-carousel .swiper-pagination-bullet {
            width: 14px;
            height: 14px;
            background: rgba(255, 255, 255, 0.55);
            opacity: 1;
            border: 2px solid rgba(46, 202, 106, 0.55);
            transition: all 0.25s ease;
          }

          .intro-carousel .swiper-pagination-bullet-active {
            background: #2eca6a;
            transform: scale(1.2);
            border-color: #2eca6a;
          }
        `}</style>
        <section className="section-services section-t8 py-5 services-section-bg">
          <div className="container">
            <div className="row mb-5">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-center section-title-modern">
                  <div className="title-box text-center">
                    <h2 className="title-a fw-bold">DỊCH VỤ CỦA CHÚNG TÔI</h2>
                    <div className="title-underline"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4 mb-5">
              {[
                {
                  title: "An Toàn",
                  icon: "bi-shield-check",
                  description: "Hệ thống quản lý ký túc xá giúp kiểm soát thông tin cư trú, ra vào và tình trạng phòng ở một cách chặt chẽ. Mọi dữ liệu được lưu trữ an toàn, minh bạch.",
                },
                {
                  title: "0% Lãi",
                  icon: "bi-currency-dollar",
                  description: "Quy trình quản lý chi phí minh bạch, hỗ trợ theo dõi các khoản phí phòng, điện nước và dịch vụ một cách rõ ràng. Hệ thống giúp tối ưu chi phí vận hành.",
                },
                {
                  title: "Nhanh",
                  icon: "bi-lightning-fill",
                  description: "Tự động hóa các quy trình như đăng ký phòng, cập nhật thông tin cư trú, xử lý yêu cầu và báo cáo quản lý. Mọi thao tác được thực hiện nhanh chóng.",
                },
              ].map((service, index) => (
                <div className="col-md-6 col-lg-4" key={index}>
                  <div className="card h-100 rounded-4 shadow-sm border-0 overflow-hidden bg-white modern-card services-panel">
                    <div className="position-relative img-hover-zoom service-hero">
                      <div
                        className="d-flex align-items-center justify-content-center w-100 h-100"
                      >
                        <div className="text-center">
                          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: "100px", height: "100px", background: "linear-gradient(135deg, #10B981, #34D399)", color: "#fff", fontSize: "3rem" }}>
                            <i className={`bi ${service.icon}`}></i>
                          </div>
                          <h3 className="fw-bold service-title mb-0" style={{ color: "#1a1a1a" }}>
                            {service.title}
                          </h3>
                        </div>
                      </div>
                      <div
                        className="position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)", height: "55%" }}
                      >
                        <div>
                          <span className="badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: "#10B981" }}>
                            Dịch vụ
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <ul className="list-unstyled mb-0">
                        <li className="d-flex align-items-start mb-2 border-bottom border-light contact-item">
                          <i className="bi bi-check2-circle text-success fs-5 me-3 mt-1"></i>
                          <span className="text-muted fw-medium service-description" style={{ lineHeight: "1.6" }}>
                            {service.description}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <span className="btn btn-primary rounded-circle shadow-sm social-btn-hover" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="bi bi-stars fs-6 text-white"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-property section-t8 py-5">
          <div className="container">
            <div className="row mb-5">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-center section-title-modern">
                  <div className="title-box text-center">
                    <h2 className="title-a fw-bold">BÀI ĐĂNG MỚI NHẤT</h2>
                    <div className="title-underline"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-5">
              {rooms.slice(0, 3).map((room) => (
                <div className="col-md-6 col-lg-4" key={room.id}>
                  <div className="card h-100 rounded-4 shadow-sm border-0 overflow-hidden bg-white modern-card">
                    <div className="position-relative img-hover-zoom">
                      <img
                        src={
                          room.roomMedia && room.roomMedia[0]
                            ? API_BASE_URL + "/document/" + room.roomMedia[0].files
                            : "assets/img/property-1.jpg"
                        }
                        alt={room.title}
                        className="card-img-top w-100"
                        style={{ height: "350px", objectFit: "cover" }}
                      />
                      <div
                        className="position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)", height: "60%" }}
                      >
                        <h3 className="card-title text-white mb-2 fs-4 fw-bold">
                          <Link to={`/rental-home/${room.id}`} className="text-white text-decoration-none">
                            {room.title}
                          </Link>
                        </h3>
                        <div>
                          <span className="badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: "#10B981" }}>
                            {room.status === "ROOM_RENT" && `Cho thuê | ${formatVnd(room.price)}`}
                            {room.status === "HIRED" && `Đã thuê | ${formatVnd(room.price)}`}
                            {room.status === "CHECKED_OUT" && `Đã trả phòng | ${formatVnd(room.price)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <ul className="list-unstyled mb-0">
                        <li className="d-flex align-items-start mb-2 border-bottom border-light contact-item">
                          <i className="bi bi-geo-alt-fill text-success fs-5 me-3 mt-1"></i>
                          <span className="text-muted small fw-medium" style={{ lineHeight: "1.6" }}>
                            {room.location?.cityName || "Chưa cập nhật vị trí"}
                          </span>
                        </li>
                        <li className="d-flex align-items-center mb-2 border-bottom border-light contact-item">
                          <i className="bi bi-tag-fill text-success fs-5 me-3"></i>
                          <strong className="text-dark">
                            {room.category?.name || "Chưa cập nhật loại"}
                          </strong>
                        </li>
                        <li className="d-flex align-items-center mb-1 contact-item">
                          <i className="bi bi-person-fill text-success fs-5 me-3"></i>
                          <span className="text-muted small text-truncate fw-medium">
                            {room.user?.name || "Chưa cập nhật người cho thuê"}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <span className="btn btn-primary rounded-circle shadow-sm social-btn-hover" style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="bi bi-house-heart fs-6 text-white"></i>
                        </span>
                      </div>
                      <Link to={`/rental-home/${room.id}`} className="btn text-white rounded-pill px-4 fw-bold shadow-sm btn-modern" style={{ backgroundColor: "#10B981" }}>
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row mt-5">
              <div className="col-md-12 text-center">
                <a href="/rental-home" className="btn btn-outline-success rounded-pill px-5" style={{ borderColor: "#2eca6a", color: "#2eca6a", fontWeight: "600" }}>
                  Xem tất cả bài đăng
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section-agents section-t8 py-5 bg-light">
          <div className="container">
            <div className="row mb-5">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-center section-title-modern">
                  <div className="title-box text-center">
                    <h2 className="title-a fw-bold">NGƯỜI CHO THUÊ</h2>
                    <div className="title-underline"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4 mb-5">
              {rentaler.slice(0, 3).map((rentaler) => (
                <div className="col-md-6 col-lg-4" key={rentaler.id}>
                  <div className="card h-100 rounded-4 shadow-sm border-0 overflow-hidden bg-white modern-card">
                    <div className="position-relative img-hover-zoom">
                      <img
                        src={rentaler?.imageUrl || "assets/img/agent-4.jpg"}
                        alt={rentaler.name}
                        className="card-img-top w-100"
                        style={{ height: "350px", objectFit: "cover" }}
                      />
                      <div
                        className="position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)", height: "60%" }}
                      >
                        <h3 className="card-title text-white mb-2 fs-4 fw-bold">
                          <Link to={`/angent-single/${rentaler.id}`} className="text-white text-decoration-none">
                            {rentaler.name}
                          </Link>
                        </h3>
                        <div>
                          <span className="badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: "#10B981" }}>
                            Quản lý / Chủ nhà
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <ul className="list-unstyled mb-0">
                        <li className="d-flex align-items-start mb-2 border-bottom border-light contact-item">
                          <i className="bi bi-geo-alt-fill text-success fs-5 me-3 mt-1"></i>
                          <span className="text-muted small fw-medium" style={{ lineHeight: "1.6" }}>
                            {rentaler.address || "Chưa cập nhật địa chỉ"}
                          </span>
                        </li>
                        <li className="d-flex align-items-center mb-2 border-bottom border-light contact-item">
                          <i className="bi bi-telephone-fill text-success fs-5 me-3"></i>
                          <strong className="text-dark">
                            {rentaler.phone || "Chưa cập nhật"}
                          </strong>
                        </li>
                        <li className="d-flex align-items-center mb-1 contact-item">
                          <i className="bi bi-envelope-fill text-success fs-5 me-3"></i>
                          <span className="text-muted small text-truncate fw-medium">
                            {rentaler.email}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        {rentaler?.facebookUrl && (
                          <a
                            href={rentaler.facebookUrl}
                            className="btn btn-primary rounded-circle shadow-sm social-btn-hover"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <i className="bi bi-facebook fs-6 text-white"></i>
                          </a>
                        )}
                        {rentaler?.zaloUrl && (
                          <a
                            href={rentaler.zaloUrl}
                            className="btn btn-info rounded-circle shadow-sm social-btn-hover text-white"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="fs-6" viewBox="0 0 50 50">
                              <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z"></path>
                            </svg>
                          </a>
                        )}
                      </div>
                      <Link
                        to={`/angent-single/${rentaler.id}`}
                        className="btn text-white rounded-pill px-4 fw-bold shadow-sm btn-modern"
                        style={{ backgroundColor: "#10B981" }}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row mt-5">
              <div className="col-md-12 text-center">
                <Link to="/angent-gird" className="btn btn-outline-success rounded-pill px-5" style={{ borderColor: "#2eca6a", color: "#2eca6a", fontWeight: "600" }}>
                  Xem tất cả người cho thuê
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-testimonials section-t8 nav-arrow-a py-5 section-testimonials-modern bg-light">
          <div className="container">
            <div className="row mb-5">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-center section-title-modern">
                  <div className="title-box text-center">
                    <h2 className="title-a fw-bold testimonial-title-modern">ĐÁNH GIÁ VỀ CHÚNG TÔI</h2>
                    <div className="testimonial-underline"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-11 col-lg-10">
                <Swiper
                  spaceBetween={30}
                  centeredSlides={true}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  navigation={true}
                  modules={[Autoplay, Pagination, Navigation]}
                  className="swiper-wrapper py-4"
                >
                  <SwiperSlide>
                    <div className="testimonials-box testimonial-card-modern p-4 p-md-5 rounded-4 shadow-sm border">
                      <div className="row align-items-center">
                        <div className="col-sm-12 col-md-5 text-center mb-3 mb-md-0">
                          <div className="testimonial-hero rounded-4 shadow-sm d-flex align-items-center justify-content-center overflow-hidden">
                            <img src="../assets/img/agent-6.jpg" alt="Lê Kiên" className="img-fluid rounded-4 shadow" style={{ height: "100%", maxHeight: "300px", objectFit: "cover" }} />
                          </div>
                        </div>
                        <div className="col-sm-12 col-md-7 px-4">
                          <div className="testimonial-ico text-success mb-3" style={{ fontSize: "2.5rem" }}>
                            <i className="bi bi-chat-quote-fill"></i>
                          </div>
                          <p className="testimonial-text font-italic text-muted mb-4">
                            "Các phòng trọ rất tuyệt vời sạch sẽ thoáng mát"
                          </p>
                          <div className="d-flex align-items-center">
                            <img src="../assets/img/agent-6.jpg" alt="Avatar" className="rounded-circle shadow-sm me-3" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                            <h5 className="testimonial-author fw-bold mb-0">Lê Kiên</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide>
                    <div className="testimonials-box testimonial-card-modern p-4 p-md-5 rounded-4 shadow-sm border">
                      <div className="row align-items-center">
                        <div className="col-sm-12 col-md-5 text-center mb-3 mb-md-0">
                          <div className="testimonial-hero rounded-4 shadow-sm d-flex align-items-center justify-content-center overflow-hidden">
                            <img src="../assets/img/agent-7.jpg" alt="Trần Hiển" className="img-fluid rounded-4 shadow" style={{ height: "100%", maxHeight: "300px", objectFit: "cover" }} />
                          </div>
                        </div>
                        <div className="col-sm-12 col-md-7 px-4">
                          <div className="testimonial-ico text-success mb-3" style={{ fontSize: "2.5rem" }}>
                            <i className="bi bi-chat-quote-fill"></i>
                          </div>
                          <p className="testimonial-text font-italic text-muted mb-4">
                            "Không có lời nào diễn tả được cảm xúc của tôi lúc này"
                          </p>
                          <div className="d-flex align-items-center">
                            <img src="../assets/img/agent-7.jpg" alt="Avatar" className="rounded-circle shadow-sm me-3" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                            <h5 className="testimonial-author fw-bold mb-0">Trần Hiển</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide>
                    <div className="testimonials-box testimonial-card-modern p-4 p-md-5 rounded-4 shadow-sm border">
                      <div className="row align-items-center">
                        <div className="col-sm-12 col-md-5 text-center mb-3 mb-md-0">
                          <div className="testimonial-hero rounded-4 shadow-sm d-flex align-items-center justify-content-center overflow-hidden">
                            <img src="../assets/img/agent-5.jpg" alt="Hà Linh" className="img-fluid rounded-4 shadow" style={{ height: "100%", maxHeight: "300px", objectFit: "cover" }} />
                          </div>
                        </div>
                        <div className="col-sm-12 col-md-7 px-4">
                          <div className="testimonial-ico text-success mb-3" style={{ fontSize: "2.5rem" }}>
                            <i className="bi bi-chat-quote-fill"></i>
                          </div>
                          <p className="testimonial-text font-italic text-muted mb-4">
                            "Hạnh phúc của tôi là kiếm được một căn trọ sạch sẽ và đẹp đẽ mà lại còn gần trường."
                          </p>
                          <div className="d-flex align-items-center">
                            <img src="../assets/img/agent-5.jpg" alt="Avatar" className="rounded-circle shadow-sm me-3" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                            <h5 className="testimonial-author fw-bold mb-0">Hà Linh</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default Home;