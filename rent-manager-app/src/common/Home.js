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

    getAllAccountRentalerForCustomer(0, 6)
      .then((response) => {
        this.setState({
          rentaler: response.content || [],
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
        <section className="section-services section-t8 py-5 bg-light">
          <div className="container">
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-between align-items-center">
                  <div className="title-box">
                    <h2 className="title-a fw-bold">Dịch vụ của chúng tôi</h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card-box-c foo h-100 p-4 bg-white rounded-4 shadow-sm text-center">
                  <div className="card-header-c d-flex flex-column align-items-center justify-content-center w-100 mb-3">
                    <div className="card-box-ico text-success mb-2 d-flex justify-content-center" style={{ fontSize: "3rem" }}>
                      <span className="bi bi-cart"></span>
                    </div>
                    <div className="card-title-c w-100">
                      <h2 className="title-c fw-bold fs-4 m-0 text-center">An Toàn</h2>
                    </div>
                  </div>
                  <div className="card-body-c">
                    <p className="content-c text-muted">
                      Hệ thống quản lý ký túc xá giúp kiểm soát thông tin cư
                      trú, ra vào và tình trạng phòng ở một cách chặt chẽ. Mọi
                      dữ liệu được lưu trữ an toàn, minh bạch, giúp ban quản lý
                      dễ dàng theo dõi và đảm bảo môi trường sống an toàn cho
                      sinh viên.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card-box-c foo h-100 p-4 bg-white rounded-4 shadow-sm text-center">
                  <div className="card-header-c d-flex flex-column align-items-center justify-content-center w-100 mb-3">
                    <div className="card-box-ico text-success mb-2 d-flex justify-content-center" style={{ fontSize: "3rem" }}>
                      <span className="bi bi-cart"></span>
                    </div>
                    <div className="card-title-c w-100">
                      <h2 className="title-c fw-bold fs-4 m-0 text-center">0% Lãi</h2>
                    </div>
                  </div>
                  <div className="card-body-c">
                    <p className="content-c text-muted">
                      Quy trình quản lý chi phí minh bạch, hỗ trợ theo dõi các khoản phí
                      phòng, điện nước và dịch vụ một cách rõ ràng. Hệ thống giúp tối ưu
                      chi phí vận hành, hạn chế sai sót và mang lại lợi ích tối đa cho cả
                      ban quản lý và người ở.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card-box-c foo h-100 p-4 bg-white rounded-4 shadow-sm text-center">
                  <div className="card-header-c d-flex flex-column align-items-center justify-content-center w-100 mb-3">
                    <div className="card-box-ico text-success mb-2 d-flex justify-content-center" style={{ fontSize: "3rem" }}>
                      <span className="bi bi-cart"></span>
                    </div>
                    <div className="card-title-c w-100">
                      <h2 className="title-c fw-bold fs-4 m-0 text-center">Nhanh</h2>
                    </div>
                  </div>
                  <div className="card-body-c">
                    <p className="content-c text-muted">
                      Tự động hóa các quy trình như đăng ký phòng, cập nhật thông tin cư trú,
                      xử lý yêu cầu và báo cáo quản lý. Nhờ đó, mọi thao tác được thực hiện
                      nhanh chóng, tiết kiệm thời gian và nâng cao hiệu quả vận hành ký túc xá.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-property section-t8 py-5">
          <div className="container">
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-between align-items-center">
                  <div className="title-box">
                    <h2 className="title-a fw-bold">Bài đăng mới nhất</h2>
                  </div>
                  <div className="title-link">
                    <a href="/rental-home" className="text-decoration-none text-success fw-bold">
                      Tất cả bài đăng <span className="bi bi-chevron-right"></span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {rooms.map((room) => (
                <div className="col-md-4" key={room.id}>
                  <div className="card-box-a card-shadow h-100 rounded-4 overflow-hidden position-relative">
                    <div className="img-box-a h-100">
                      <img
                        src={
                          room.roomMedia && room.roomMedia[0]
                            ? API_BASE_URL + "/document/" + room.roomMedia[0].files
                            : "assets/img/property-1.jpg"
                        }
                        alt={room.title}
                        className="img-a img-fluid w-100"
                        style={{ height: "450px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="card-overlay">
                      <div className="card-overlay-a-content p-4 d-flex flex-column justify-content-end h-100">
                        <div className="card-header-a mb-2">
                          <h2 className="card-title-a text-white fs-4">
                            <Link to={`/rental-home/${room.id}`} className="text-decoration-none text-white">
                              <b>{room.title}</b>
                              <br /> <small className="fs-6 fw-normal">{room.description}</small>
                            </Link>
                          </h2>
                        </div>
                        <div className="card-body-a">
                          <div className="price-box d-flex mb-3">
                            <span className="price-a bg-success text-white px-3 py-2 rounded-pill fw-bold">
                              {room.status === "ROOM_RENT" &&
                                `Cho thuê | ${room.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`}
                              {room.status === "HIRED" &&
                                `Đã thuê | ${room.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`}
                              {room.status === "CHECKED_OUT" &&
                                `Đã trả phòng | ${room.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`}
                            </span>
                          </div>
                          <Link to={`/rental-home/${room.id}`} className="text-white text-decoration-none fw-bold">
                            Xem chi tiết <span className="bi bi-chevron-right"></span>
                          </Link>
                        </div>
                        <div className="card-footer-a mt-3 border-top pt-3">
                          <ul className="card-info d-flex justify-content-between list-unstyled mb-0 text-white">
                            <li className="text-center">
                              <h4 className="card-info-title fs-6 text-uppercase mb-1">Vị trí</h4>
                              <span className="fw-bold">{room.location?.cityName}</span>
                            </li>
                            <li className="text-center">
                              <h4 className="card-info-title fs-6 text-uppercase mb-1">Loại</h4>
                              <span className="fw-bold">{room.category?.name}</span>
                            </li>
                            <li className="text-center">
                              <h4 className="card-info-title fs-6 text-uppercase mb-1">Người cho thuê</h4>
                              <span className="fw-bold">{room.user?.name}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-agents section-t8 py-5 bg-light">
          <div className="container">
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-between align-items-center">
                  <div className="title-box">
                    <h2 className="title-a fw-bold">Người cho thuê</h2>
                  </div>
                  <div className="title-link">
                    <Link to="/angent-gird" className="text-decoration-none text-success fw-bold">
                      Tất cả người cho thuê trọ <span className="bi bi-chevron-right"></span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4">
              {rentaler.map((rentaler) => (
                <div className="col-md-4" key={rentaler.id}>
                  <div className="card-box-d shadow-sm rounded-4 overflow-hidden position-relative h-100">
                    <div className="card-img-d h-100">
                      <img
                        src={rentaler?.imageUrl || "assets/img/agent-4.jpg"}
                        alt={rentaler?.name || "Agent placeholder"}
                        className="img-d img-fluid w-100"
                        style={{ height: "400px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="card-overlay card-overlay-hover p-4 d-flex flex-column justify-content-end">
                      <div className="card-header-d mb-2">
                        <div className="card-title-d">
                          <h3 className="title-d fs-4">
                            <Link to={`/angent-single/${rentaler.id}`} className="text-white text-decoration-none fw-bold">
                              {rentaler?.name}
                            </Link>
                          </h3>
                        </div>
                      </div>
                      <div className="card-body-d">
                        <p className="content-d text-white mb-3">
                          <i className="bi bi-geo-alt-fill me-2"></i>
                          {rentaler?.address || "Địa chỉ chưa cập nhật"}
                        </p>
                        <div className="info-agents text-white">
                          <p className="mb-1">
                            <i className="bi bi-telephone-fill me-2"></i>
                            <strong>Phone: </strong> {rentaler?.phone || "Chưa cập nhật"}
                          </p>
                          <p className="mb-0">
                            <i className="bi bi-envelope-fill me-2"></i>
                            <strong>Email: </strong> {rentaler?.email}
                          </p>
                        </div>
                      </div>
                      <div className="card-footer-d mt-3">
                        <div className="socials-footer d-flex justify-content-start gap-3">
                          {rentaler?.facebookUrl && (
                            <a href={rentaler.facebookUrl} className="text-white fs-4" target="_blank" rel="noopener noreferrer">
                              <i className="bi bi-facebook" aria-hidden="true"></i>
                            </a>
                          )}
                          {rentaler?.zaloUrl && (
                            <a href={rentaler.zaloUrl} className="text-white" target="_blank" rel="noopener noreferrer" style={{ marginTop: "4px" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 50 50">
                                <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z">
                                </path>
                              </svg>
                            </a>
                          )}
                          <Link to={`/angent-single/${rentaler.id}`} className="text-white fs-4">
                            <i className="bi bi-info-circle" aria-hidden="true"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-testimonials section-t8 nav-arrow-a py-5">
          <div className="container">
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="title-wrap d-flex justify-content-center">
                  <div className="title-box text-center">
                    <h2 className="title-a fw-bold">Đánh giá về chúng tôi</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-10">
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
                    <div className="testimonials-box bg-white p-4 rounded-4 shadow-sm border">
                      <div className="row align-items-center">
                        <div className="col-sm-12 col-md-5 text-center mb-3 mb-md-0">
                          <img src="../assets/img/agent-6.jpg" alt="Lê Kiên" className="img-fluid rounded-4 shadow" style={{ height: "300px", objectFit: "cover" }} />
                        </div>
                        <div className="col-sm-12 col-md-7 px-4">
                          <div className="testimonial-ico text-success mb-3" style={{ fontSize: "2.5rem" }}>
                            <i className="bi bi-chat-quote-fill"></i>
                          </div>
                          <p className="testimonial-text fs-5 font-italic text-muted mb-4">
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
                    <div className="testimonials-box bg-white p-4 rounded-4 shadow-sm border">
                      <div className="row align-items-center">
                        <div className="col-sm-12 col-md-5 text-center mb-3 mb-md-0">
                          <img src="../assets/img/agent-7.jpg" alt="Trần Hiển" className="img-fluid rounded-4 shadow" style={{ height: "300px", objectFit: "cover" }} />
                        </div>
                        <div className="col-sm-12 col-md-7 px-4">
                          <div className="testimonial-ico text-success mb-3" style={{ fontSize: "2.5rem" }}>
                            <i className="bi bi-chat-quote-fill"></i>
                          </div>
                          <p className="testimonial-text fs-5 font-italic text-muted mb-4">
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
                    <div className="testimonials-box bg-white p-4 rounded-4 shadow-sm border">
                      <div className="row align-items-center">
                        <div className="col-sm-12 col-md-5 text-center mb-3 mb-md-0">
                          <img src="../assets/img/agent-5.jpg" alt="Hà Linh" className="img-fluid rounded-4 shadow" style={{ height: "300px", objectFit: "cover" }} />
                        </div>
                        <div className="col-sm-12 col-md-7 px-4">
                          <div className="testimonial-ico text-success mb-3" style={{ fontSize: "2.5rem" }}>
                            <i className="bi bi-chat-quote-fill"></i>
                          </div>
                          <p className="testimonial-text fs-5 font-italic text-muted mb-4">
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