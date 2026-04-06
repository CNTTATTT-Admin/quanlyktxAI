import React, { Component } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "react-alice-carousel/lib/alice-carousel.css";
import { Link, NavLink } from "react-router-dom";
import { Navigation } from "swiper/modules";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import { Button, Comment, Form } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Map from "../rentaler/map/MyMapComponent";
import {
  checkRequestStatus,
  saveBlog,
  sendEmailForContact,
  sendRequestForRentaler,
} from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../constants/Connect";

class RentailHomeDetail extends Component {

  // =================================================================
  // 🧠 BỘ LOGIC CŨ ĐƯỢC GIỮ NGUYÊN VẸN 100%
  // =================================================================
  constructor(props) {
    super(props);
    this.state = {
      rooms: null,
      showCommentForm: false,
      content: "",
      rate: 5,
      submittingComment: false,
      comments: [],
      toEmail: "",
      description: "",
      title: "",
      nameOfRentaler: "",
      requestSent: false,
      requesting: false,
      isSaved: false,
    };
  }

  componentDidMount() {
    this.fetchRooms();
    this.fetchComments();
    this.fetchRequestStatus();
    this.fetchSaveStatus();
  }

  fetchSaveStatus = () => {
    const id = window.location.pathname.split("/").pop();
    if (this.props.authenticated) {
      const { checkBlogSavedStatus } = require("../../services/fetch/ApiUtils");
      checkBlogSavedStatus(id)
        .then((response) => {
          this.setState({ isSaved: response });
        })
        .catch((error) => {
          console.error("Error checking save status:", error);
        });
    }
  };

  fetchRequestStatus = () => {
    const id = window.location.pathname.split("/").pop();
    if (this.props.authenticated) {
      checkRequestStatus(id)
        .then((response) => {
          this.setState({ requestSent: response });
        })
        .catch((error) => {
          console.error("Error checking request status:", error);
        });
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const sendEmailRequest = {
      title: this.state.title,
      nameOfRentaler: this.state.nameOfRentaler,
      toEmail: this.state.toEmail,
      description: this.state.description,
    };
    sendEmailForContact(sendEmailRequest)
      .then((response) => {
        toast.success(response.message);
        this.setState({
          title: "",
          nameOfRentaler: "",
          description: "",
        });
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  fetchRooms = async () => {
    try {
      const id = window.location.pathname.split("/").pop();
      const response = await axios.get(`${API_BASE_URL}/room/${id}`);
      const data = response.data;

      this.setState({
        rooms: data,
        toEmail: data.user?.email,
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  fetchComments = async () => {
    try {
      const id = window.location.pathname.split("/").pop();
      const response = await axios.get(`${API_BASE_URL}/room/${id}/comments`);
      this.setState({
        comments: response.data,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  handleSaveBlog = (id) => {
    if (!this.props.authenticated) {
      toast.error("Vui lòng đăng nhập để có thể lưu bài đăng.");
      return;
    }

    const { isSaved } = this.state;
    const { saveBlog, unsaveBlog } = require("../../services/fetch/ApiUtils");

    if (isSaved) {
      unsaveBlog(id)
        .then((response) => {
          toast.success(response.message);
          this.setState({ isSaved: false });
        })
        .catch((error) => {
          toast.error(
            (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
          );
        });
    } else {
      const storeRequest = { roomId: id };
      saveBlog(storeRequest)
        .then((response) => {
          toast.success(response.message);
          this.setState({ isSaved: true });
        })
        .catch((error) => {
          toast.error(
            (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
          );
        });
    }
  };

  handleRequestRoom = () => {
    const { rooms, requestSent, requesting } = this.state;
    const { currentUser } = this.props;

    if (!this.props.authenticated) {
      toast.error("Vui lòng đăng nhập để đăng ký ở.");
      return;
    }

    if (requestSent || requesting) return;

    if (currentUser && currentUser.allocatedRoomId != null) {
      toast.warning("Bạn đã có phòng, không thể đăng ký thêm.");
      return;
    }

    this.setState({ requesting: true });

    const data = {
      roomId: rooms.id,
      nameOfRent: currentUser.name,
      phone: currentUser.phone || "",
      description: "Tôi muốn đăng ký ở phòng này.",
    };

    sendRequestForRentaler(data)
      .then((response) => {
        toast.success(response.message);
        this.setState({ requestSent: true, requesting: false });
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
          "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
        this.setState({ requesting: false });
      });
  };

  handleSubmitComment = async (event) => {
    event.preventDefault();
    const { content, rate, rooms } = this.state;
    const roomId = window.location.pathname.split("/").pop();

    const commentData = {
      content: content,
      rateRating: rate,
      room_id: roomId,
    };

    const accessToken = localStorage.getItem("accessToken");

    try {
      this.setState({ submittingComment: true });
      const response = await axios.post(
        `${API_BASE_URL}/room/${roomId}/comments`,
        commentData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      this.setState({
        content: "",
        rate: 5,
        submittingComment: false,
        showCommentForm: false,
      });
      this.fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      this.setState({ submittingComment: false });
    }
  };

  // =================================================================
  // 🎨 GIAO DIỆN TƯƠNG TÁC CAO (CÓ HOVER & CHUYỂN HƯỚNG TRANG)
  // =================================================================
  render() {
    const {
      rooms,
      comments,
      showCommentForm,
      content,
      rate,
      submittingComment,
    } = this.state;

    return (
      <>
        <style>{`
          .text-emerald { color: #10B981 !important; }
          .bg-emerald { background-color: #10B981 !important; color: white !important; }
          .border-emerald { border-color: #10B981 !important; }
          
          /* Hiệu ứng Nút bấm & Form */
          .input-modern { border-radius: 8px; border: 1px solid #dee2e6; transition: all 0.3s ease; }
          .input-modern:focus { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important; border-color: #10B981 !important; transform: translateY(-1px); }
          .btn-modern { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .btn-modern:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3) !important; }
          
          /* Hiệu ứng Slider Ảnh */
          .img-overlay-gradient { background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); transition: opacity 0.3s ease; }
          .swiper-slide img { transition: transform 0.6s ease; }
          .swiper-slide:hover img { transform: scale(1.02); }
          
          /* Hiệu ứng Tiện ích & Thẻ người ở */
          .amenity-card { transition: all 0.2s ease; cursor: default; }
          .amenity-card:hover { background-color: #e6fcf0 !important; border-color: #10B981 !important; transform: scale(1.03); }
          .resident-card { transition: all 0.3s ease; }
          .resident-card:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.15) !important; border-color: #10B981 !important; }
          
          /* Hiệu ứng Thẻ link Chủ trọ */
          .agent-link-card { display: flex; align-items: center; text-decoration: none; padding: 10px; margin-left: -10px; border-radius: 12px; transition: all 0.3s ease; }
          .agent-link-card img { transition: all 0.3s ease; }
          .agent-link-card h6 { transition: color 0.3s ease; }
          .agent-link-card:hover { background-color: #f8f9fa; }
          .agent-link-card:hover img { transform: scale(1.1); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2) !important; }
          .agent-link-card:hover h6 { color: #10B981 !important; }

          .sticky-form { position: sticky; top: 100px; z-index: 100; }
        `}</style>

        <Header
          authenticated={this.props.authenticated}
          currentUser={this.props.currentUser}
          onLogout={this.props.onLogout}
        />

        <main id="main" style={{ backgroundColor: "#F0FDF4", minHeight: "100vh" }} className="pt-5 mt-4 pb-5">
          <section className="intro-single pt-5 pb-2">
            <div className="container mt-4">
              <div className="row align-items-center">

                <div className="col-md-12 col-lg-6">
                  <div className="title-single-box">
                    <h1 className="title-single fw-bold text-dark" style={{ fontSize: "2.2rem" }}>{rooms?.title}</h1>
                    <span className="text-muted fw-semibold mt-2 d-block">
                      Thông tin đầy đủ về không gian sống của bạn.
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
                        <Link to="/rental-home" className="text-decoration-none text-success">Phòng Ký Túc Xá</Link>
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
          <div className="container mt-4">

            <div className="row g-4">
              {/* ========================================== */}
              {/* CỘT TRÁI (8/12) - THÔNG TIN CHÍNH           */}
              {/* ========================================== */}
              <div className="col-lg-8 d-flex flex-column gap-4">

                {/* 1. KHỐI ẢNH */}
                <div className="bg-white rounded-4 shadow-sm border-0 position-relative overflow-hidden">
                  <Swiper
                    autoHeight={true}
                    navigation={true}
                    modules={[Navigation]}
                    className="swiper-wrapper"
                    style={{ backgroundColor: "#f8f9fa", borderRadius: "16px" }}
                  >
                    {rooms && rooms.roomMedia && rooms.roomMedia.length > 0 ? (
                      rooms.roomMedia.map((media, index) => (
                        <SwiperSlide key={index} className="carousel-item-b swiper-slide" style={{overflow: 'hidden'}}>
                          <img
                            src={API_BASE_URL + "/document/" + media.files}
                            alt=""
                            style={{ width: "100%", height: "450px", objectFit: "cover", borderRadius: "16px" }}
                          />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide className="carousel-item-b swiper-slide" style={{overflow: 'hidden'}}>
                        <img
                          src="/assets/img/property-1.jpg"
                          alt="Mặc định"
                          className="card-img-top object-fit-cover"
                          style={{ width: "100%", height: "450px", borderRadius: "16px" }}
                        />
                      </SwiperSlide>
                    )}
                  </Swiper>

                  <div className="position-absolute bottom-0 start-0 w-100 p-4 img-overlay-gradient" style={{ zIndex: 10, borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px", pointerEvents: "none" }}>
                    <h2 className="text-white fw-bold mb-1" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                      {rooms ? rooms.title : "Đang tải..."}
                    </h2>
                    <span className="text-light fw-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                      <i className="bi bi-geo-alt-fill text-emerald me-1"></i>
                      {rooms ? rooms.location?.cityName : "Khu vực"}
                    </span>
                  </div>
                </div>

                {/* 2. KHỐI MÔ TẢ & THÔNG TIN CƠ BẢN */}
                <div className="bg-white p-4 rounded-4 shadow-sm border-0">
                  <div className="row g-4">
                    <div className="col-md-7 border-end pe-md-4">
                      <h5 className="fw-bold text-emerald mb-3">Mô tả chi tiết</h5>
                      <p className="text-muted mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.8", fontSize: "0.95rem" }}>
                        {rooms ? rooms.description : "Đang cập nhật mô tả..."}
                      </p>
                    </div>
                    <div className="col-md-5 ps-md-4">
                      <h5 className="fw-bold text-dark mb-3">Thông tin cơ bản</h5>
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                        <li className="d-flex justify-content-between align-items-start text-muted small">
                          <span className="text-nowrap me-3"><i className="bi bi-geo-alt-fill me-2 opacity-75"></i>Địa chỉ</span>
                          <strong className="text-dark text-end">{rooms && rooms?.address}</strong>
                        </li>
                        <li className="d-flex justify-content-between text-muted small">
                          <span><i className="bi bi-tags-fill me-2 opacity-75"></i>Loại phòng</span>
                          <strong className="text-dark">{rooms && rooms.category?.name}</strong>
                        </li>
                        <li className="d-flex justify-content-between align-items-center text-muted small">
                          <span><i className="bi bi-info-circle-fill me-2 opacity-75"></i>Trạng thái</span>
                          <span
                            className={`badge rounded-pill fw-semibold ${rooms?.status === "AVAILABLE" || rooms?.status === "ROOM_RENT"
                                ? "bg-emerald"
                                : rooms?.status === "PARTIALLY_FILLED"
                                  ? "bg-warning text-dark"
                                  : rooms?.status === "FULL" || rooms?.status === "HIRED"
                                    ? "bg-danger"
                                    : "bg-secondary"
                              }`}
                          >
                            {rooms?.status === "AVAILABLE" && "Trống"}
                            {rooms?.status === "PARTIALLY_FILLED" && "Còn chỗ"}
                            {rooms?.status === "FULL" && "Đã đủ người"}
                            {rooms?.status === "MAINTENANCE" && "Bảo trì"}
                            {rooms?.status === "ROOM_RENT" && "Khả dụng"}
                            {rooms?.status === "HIRED" && "Đã đủ người"}
                            {rooms?.status === "CHECKED_OUT" && "Đã trả phòng"}
                          </span>
                        </li>
                        <li className="d-flex justify-content-between text-muted small">
                          <span><i className="bi bi-people-fill me-2 opacity-75"></i>Sức chứa</span>
                          <strong className="text-dark">{rooms?.maxOccupancy} người</strong>
                        </li>
                        <li className="d-flex justify-content-between text-muted small">
                          <span><i className="bi bi-layers-fill me-2 opacity-75"></i>Tầng</span>
                          <strong className="text-dark">Tầng {rooms?.floor}</strong>
                        </li>
                        <li className="d-flex justify-content-between text-muted small">
                          <span><i className="bi bi-wifi me-2 opacity-75"></i>Tiền mạng</span>
                          <strong className="text-dark">{rooms?.internetCost?.toLocaleString("vi-VN")} đ/tháng</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. KHỐI TIỆN NGHI CÓ SẴN (Thêm hover vào thẻ) */}
                <div className="bg-white p-4 rounded-4 shadow-sm border-0">
                  <h5 className="fw-bold text-emerald mb-3">Tiện nghi có sẵn</h5>
                  {rooms && rooms.assets?.length > 0 ? (
                    <div className="row g-3">
                      {rooms.assets.map((item, index) => (
                        <div key={index} className="col-md-4 col-6">
                          <div className="amenity-card d-flex align-items-center text-muted bg-light p-2 rounded-3 border">
                            <i className="bi bi-check-circle-fill text-emerald me-2"></i>
                            <span className="small fw-semibold text-truncate">{item?.name} <span className="text-dark ms-1">({item.number})</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0 font-italic">Phòng trống chưa có nội thất.</p>
                  )}
                </div>

                {/* 4. KHỐI NGƯỜI ĐANG Ở (Thêm hover vào thẻ người ở) */}
                <div className="bg-white p-4 rounded-4 shadow-sm border-0">
                  <h5 className="fw-bold mb-4 fs-5 text-dark d-flex align-items-center">
                    <i className="bi bi-person-lines-fill text-emerald me-2"></i> Người đang ở
                    <span className="badge bg-light text-dark border ms-3 rounded-pill fw-semibold">
                      {rooms?.currentOccupancy ?? 0} / {rooms?.maxOccupancy ?? 0}
                    </span>
                  </h5>

                  <div className="row g-3">
                    {rooms?.residents && rooms.residents.length > 0 ? (
                      rooms.residents.map((resident, index) => (
                        <div key={resident.id || index} className="col-md-6">
                          <div className="resident-card d-flex align-items-center p-3 border rounded-4 bg-light shadow-sm">
                            <img
                              src={resident?.imageUrl || "/assets/img/agent-1.jpg"}
                              alt={resident.name}
                              className="rounded-circle shadow-sm border border-2 border-white"
                              style={{ width: "55px", height: "55px", objectFit: "cover", flexShrink: 0 }}
                            />
                            <div className="ms-3 overflow-hidden">
                              <div className="fw-bold text-dark text-truncate" style={{ fontSize: "15px" }}>
                                {resident.name}
                              </div>
                              {resident.phone && (
                                <div className="text-muted mt-1 fw-semibold" style={{ fontSize: "12px" }}>
                                  <i className="bi bi-telephone-fill text-emerald me-1"></i> {resident.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-4 bg-light rounded-4 border border-dashed">
                        <div className="text-muted mb-0 font-italic">
                          Chưa có ai đang ở trong phòng này.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. KHỐI ĐÁNH GIÁ TỪ NGƯỜI DÙNG */}
                <div className="bg-white p-4 rounded-4 shadow-sm border-0">
                  <h5 className="fw-bold mb-4 fs-5 text-dark"><i className="bi bi-chat-left-text-fill text-emerald me-2"></i> Đánh giá từ người dùng</h5>

                  <Comment.Group size="large" className="w-100 mb-4">
                    {comments && comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <Comment key={index} className="bg-light p-3 rounded-4 mb-3 border-0 shadow-sm resident-card">
                          {comment.user?.imageUrl ? (
                            <Comment.Avatar src={comment.user.imageUrl} className="rounded-circle shadow-sm" />
                          ) : (
                            <Comment.Avatar src="/assets/img/agent-1.jpg" className="rounded-circle shadow-sm" />
                          )}
                          <Comment.Content className="ms-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <Comment.Author as="span" className="fw-bold fs-6 text-dark">{comment.user?.name}</Comment.Author>
                              <Comment.Metadata className="text-muted small fw-semibold">
                                <i className="bi bi-clock me-1"></i> {comment.createdAt}
                              </Comment.Metadata>
                            </div>
                            <Stack spacing={1} className="mb-2">
                              <Rating name="read-only" value={comment.rateRating} precision={0.5} readOnly size="small" />
                            </Stack>
                            <Comment.Text className="text-muted mt-2" style={{ lineHeight: "1.6" }}>{comment.content}</Comment.Text>
                          </Comment.Content>
                        </Comment>
                      ))
                    ) : (
                      <div className="text-muted font-italic py-4 text-center bg-light rounded-4 border-dashed">
                        Chưa có đánh giá nào cho phòng này.
                      </div>
                    )}
                  </Comment.Group>

                  {/* Form viết đánh giá */}
                  {this.props.authenticated ? (
                    <div className="border-top pt-4 mt-4">
                      {showCommentForm ? (
                        <Form onSubmit={this.handleSubmitComment} className="bg-light p-4 rounded-4 border-0 shadow-sm">
                          <h6 className="fw-bold mb-3 text-dark">Viết đánh giá của bạn</h6>
                          <Stack spacing={1} className="mb-3">
                            <Rating
                              name="half-rating"
                              value={rate}
                              precision={0.5}
                              size="large"
                              onChange={(event, newValue) => this.setState({ rate: newValue })}
                            />
                          </Stack>
                          <Form.TextArea
                            placeholder="Chia sẻ trải nghiệm chân thực của bạn tại đây..."
                            value={content}
                            onChange={(event) => this.setState({ content: event.target.value })}
                            style={{ borderRadius: '12px', border: '1px solid #dee2e6', backgroundColor: '#ffffff', padding: "15px", transition: "all 0.3s" }}
                            className="input-modern"
                          />
                          <div className="mt-3 d-flex gap-2">
                            <Button type="submit" className="ui button rounded-pill px-4 text-white btn-modern" style={{ backgroundColor: "#10B981" }} disabled={submittingComment}>
                              {submittingComment ? "Đang gửi..." : "Gửi đánh giá"}
                            </Button>
                            <Button type="button" className="ui button basic rounded-pill btn-modern" onClick={() => this.setState({ showCommentForm: false })}>
                              Hủy
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <button onClick={() => this.setState({ showCommentForm: true })} className="btn btn-outline-success rounded-pill px-4 py-2 fw-bold border-emerald text-emerald btn-modern">
                          <i className="bi bi-pencil-square me-2"></i> Viết đánh giá
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="alert bg-light rounded-4 border shadow-sm d-inline-block px-4 py-3">
                      <i className="bi bi-exclamation-triangle-fill text-warning fs-5 me-2 align-middle"></i>
                      <span className="text-muted fw-semibold align-middle">Vui lòng <strong className="text-emerald">đăng nhập</strong> để bình luận.</span>
                    </div>
                  )}
                </div>

              </div>


              {/* ========================================== */}
              {/* CỘT PHẢI (4/12) - THÔNG TIN GIÁ & LIÊN HỆ */}
              {/* ========================================== */}
              <div className="col-lg-4">
                <div className="sticky-form d-flex flex-column gap-4">

                  {/* THẺ GIÁ & FORM LIÊN HỆ */}
                  <div className="bg-white p-4 rounded-4 shadow-sm border-0 text-center">
                    <p className="text-muted small fw-bold text-uppercase mb-1">Giá thuê</p>
                    <h2 className="fw-bolder mb-0" style={{ color: "#2563EB", fontSize: "2rem" }}>
                      {rooms ? rooms.price?.toLocaleString("vi-VN") : "0"} đ
                    </h2>
                    <p className="text-muted small mb-4">/ tháng</p>

                    <div className="d-flex gap-2 mb-4 border-bottom pb-4">
                      <button
                        type="button"
                        onClick={() => this.handleSaveBlog(rooms?.id)}
                        className={`btn btn-modern rounded-pill fw-semibold flex-grow-1 shadow-sm ${this.state.isSaved ? "bg-emerald" : "btn-light border"}`}
                      >
                        {this.state.isSaved ? <><i className="bi bi-bookmark-fill me-1"></i> Đã lưu</> : <><i className="bi bi-bookmark me-1"></i> Lưu phòng</>}
                      </button>

                      {rooms && (rooms.currentOccupancy ?? 0) < (rooms.maxOccupancy ?? 1) ? (
                        this.props.currentUser?.allocatedRoomId != null ? (
                          <button className="btn btn-secondary rounded-pill fw-semibold flex-grow-1 shadow-sm" disabled>Bạn đã có phòng.</button>
                        ) : this.state.requestSent || this.state.requesting ? (
                          <button className="btn btn-warning rounded-pill fw-semibold flex-grow-1 shadow-sm text-white" disabled>Đang xử lý...</button>
                        ) : (
                          <button onClick={() => this.handleRequestRoom()} className="btn btn-modern bg-emerald rounded-pill fw-semibold flex-grow-1 shadow-sm border-0 text-white">
                            Đăng ký ở
                          </button>
                        )
                      ) : (
                        <button className="btn btn-secondary rounded-pill fw-semibold flex-grow-1 shadow-sm" disabled>Đã đầy</button>
                      )}
                    </div>

                    <h5 className="fw-bold text-dark text-start mb-3">Gửi tin nhắn trực tiếp</h5>
                    <form onSubmit={this.handleSubmit} className="text-start">
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-semibold mb-1">Họ và tên *</label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light input-modern"
                          placeholder="Tên của bạn"
                          name="nameOfRentaler"
                          value={this.state.nameOfRentaler}
                          onChange={this.handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-semibold mb-1">Email liên hệ *</label>
                        <input
                          type="email"
                          className="form-control form-control-lg bg-light input-modern"
                          placeholder="Email của bạn"
                          name="title"
                          value={this.state.title}
                          onChange={this.handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-muted small fw-semibold mb-1">Lời nhắn *</label>
                        <textarea
                          className="form-control bg-light input-modern p-3"
                          placeholder="Ví dụ: Tôi muốn hỏi thêm về chi phí điện nước..."
                          name="description"
                          value={this.state.description}
                          onChange={this.handleInputChange}
                          rows="4"
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-modern bg-emerald btn-lg w-100 rounded-3 fw-bold shadow-sm text-white" style={{ border: "none" }}>
                        <i className="bi bi-send-fill me-2"></i> Gửi yêu cầu
                      </button>
                    </form>
                  </div>

                  {/* THÔNG TIN CHỦ TRỌ (Gắn Link ẩn kèm Hover) */}
                  <div className="bg-white p-4 rounded-4 shadow-sm border-0">
                    <h5 className="fw-bold mb-3 fs-6 text-dark d-flex align-items-center border-bottom pb-3">
                      <i className="bi bi-shield-check text-emerald fs-4 me-2"></i> Thông tin quản lý
                    </h5>
                    
                    {/* KHỐI LINK CLICK ĐƯỢC CHUYỂN SANG TRANG NGƯỜI CHO THUÊ */}
                    <Link to={`/angent-single/${rooms?.user?.id || ''}`} className="agent-link-card mb-3">
                      <img
                        src={rooms?.user?.imageUrl || "/assets/img/agent-4.jpg"}
                        alt="Quản lý"
                        className="rounded-circle shadow-sm border border-2 border-emerald me-3 flex-shrink-0"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{rooms ? rooms.user?.name : "Đang tải..."}</h6>
                        <span className="badge bg-light text-emerald border rounded-pill">Chủ nhà / Quản lý</span>
                      </div>
                    </Link>

                    <div className="d-flex flex-column gap-2 small px-2">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-telephone-fill text-muted me-3 w-15px"></i>
                        <span className="text-dark fw-bold">{rooms ? rooms.user?.phone : "N/A"}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-envelope-fill text-muted me-3 w-15px"></i>
                        <span className="text-muted text-truncate">{rooms ? rooms.user?.email : "N/A"}</span>
                      </div>
                      <div className="d-flex align-items-start mt-1">
                        <i className="bi bi-geo-alt-fill text-muted me-3 mt-1 w-15px"></i>
                        <span className="text-muted">{rooms ? rooms.user?.address : "N/A"}</span>
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
}

export default RentailHomeDetail;