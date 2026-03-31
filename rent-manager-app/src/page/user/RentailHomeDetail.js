import React, { Component } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import axios from "axios"; // Import axios for making API requests
import { Swiper, SwiperSlide } from "swiper/react";
import "react-alice-carousel/lib/alice-carousel.css";
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
        },
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

  render() {
    console.log("Dữ liệu Current User hiện tại:", this.props.currentUser);
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
        <Header
          authenticated={this.props.authenticated}
          currentUser={this.props.currentUser}
          onLogout={this.props.onLogout}
        />
        <main id="main" className="bg-light pb-5">
          {/* HEADER CHI TIẾT */}
          <section className="intro-single pt-5 mt-5 pb-4">
            <div className="container mt-4">
              <div className="row align-items-center">
                <div className="col-md-12 col-lg-8">
                  <div className="title-single-box">
                    <h1 className="title-single fw-bold mb-2">
                      {rooms ? rooms.title : ""}
                    </h1>
                    <span className="color-text-a text-muted fs-5">
                      <i className="bi bi-geo-alt-fill text-success me-2"></i>
                      Khu vực: {rooms ? rooms.location?.cityName : ""}
                    </span>
                    <div className="mt-3 d-flex gap-2">
                      <button
                        type="button"
                        onClick={() => this.handleSaveBlog(rooms?.id)}
                        className={`btn ${
                          this.state.isSaved
                            ? "btn-success"
                            : "btn-outline-success"
                        } rounded-pill px-4 fw-bold shadow-sm`}
                      >
                        {this.state.isSaved ? (
                          <>
                            <i className="bi bi-bookmark-fill me-1"></i> Đã lưu
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bookmark me-1"></i> Lưu phòng
                          </>
                        )}
                      </button>

                      {rooms && (rooms.currentOccupancy ?? 0) < (rooms.maxOccupancy ?? 1) ? (
                        this.props.currentUser?.allocatedRoomId != null ? (
                          // NẾU ĐÃ CÓ PHÒNG: Hiện nút xám thay vì trả về null
                          <button
                            type="button"
                            className="btn btn-secondary rounded-pill px-4 fw-bold shadow-sm"
                            disabled
                          >
                            <i className="bi bi-house-check-fill me-1"></i> Bạn đã có phòng
                          </button>
                        ) : this.state.requestSent || this.state.requesting ? (
                          // NẾU ĐANG CHỜ DUYỆT YÊU CẦU
                          <button
                            type="button"
                            className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm text-white"
                            disabled
                          >
                            <i className="bi bi-hourglass-split me-1"></i> Đang xử lý...
                          </button>
                        ) : (
                          // NẾU ĐỦ ĐIỀU KIỆN ĐĂNG KÝ
                          <button
                            type="button"
                            onClick={() => this.handleRequestRoom()}
                            className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                          >
                            <i className="bi bi-person-plus-fill me-1"></i> Đăng ký ở (
                            {rooms.currentOccupancy ?? 0}/{rooms.maxOccupancy ?? 0})
                          </button>
                        )
                      ) : (
                        // NẾU PHÒNG ĐÃ ĐẦY
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill px-4 fw-bold shadow-sm"
                          disabled
                        >
                          <i className="bi bi-slash-circle me-1"></i> Phòng đã đầy (
                          {rooms?.currentOccupancy ?? "?"}/{rooms?.maxOccupancy ?? "?"})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-lg-4">
                  <nav
                    aria-label="breadcrumb"
                    className="breadcrumb-box d-flex justify-content-lg-end"
                  >
                    <ol className="breadcrumb mb-0">
                      <li className="breadcrumb-item">
                        <a href="/" className="text-decoration-none text-success">
                          Trang chủ
                        </a>
                      </li>
                      <li className="breadcrumb-item active text-muted">
                        {rooms ? rooms.category?.name : ""}
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </section>

          <section className="property-single nav-arrow-b">
            <div className="container">
              {/* SLIDER ẢNH (Bọc khung bo góc, giữ nguyên code ảnh bên trong) */}
              <div className="row justify-content-center mb-5">
                <div className="col-lg-10">
                  <div className="rounded-4 overflow-hidden shadow-sm border border-2 border-white">
                    <Swiper
                      autoHeight={true}
                      navigation={true}
                      modules={[Navigation]}
                      className="swiper-wrapper bg-dark"
                    >
                      {rooms &&
                        rooms.roomMedia?.map((media, index) => (
                          <SwiperSlide key={index} className="carousel-item-b swiper-slide">
                            <img
                              src={API_BASE_URL + "/document/" + media.files}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "600px" }}
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                </div>
              </div>

              {/* NỘI DUNG CHI TIẾT */}
              <div className="row g-4">
                {/* CỘT TRÁI: THÔNG TIN CƠ BẢN & GIÁ */}
                <div className="col-lg-5">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
                    {/* Hộp Giá */}
                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                      <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: "60px", height: "60px", fontSize: "24px" }}>
                        <i className="bi bi-cash"></i>
                      </div>
                      <div>
                        <span className="text-muted small text-uppercase fw-bold">Giá thuê</span>
                        <h3 className="mb-0 fw-bolder text-success">
                          {rooms
                            ? rooms.price?.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            : ""}
                        </h3>
                      </div>
                    </div>

                    <h4 className="fw-bold mb-3 fs-5">Thông tin chi tiết</h4>
                    <ul className="list-unstyled mb-0">
                      <li className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted"><i className="bi bi-geo-alt text-success me-2"></i> Địa chỉ</span>
                        <strong className="text-end" style={{ maxWidth: "60%" }}>{rooms && rooms?.address}</strong>
                      </li>
                      <li className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted"><i className="bi bi-tag text-success me-2"></i> Loại phòng</span>
                        <strong>{rooms && rooms.category?.name}</strong>
                      </li>
                      <li className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted"><i className="bi bi-info-circle text-success me-2"></i> Trạng thái</span>
                        <span
                          className={`badge rounded-pill ${
                            rooms?.status === "AVAILABLE"
                              ? "bg-success"
                              : rooms?.status === "PARTIALLY_FILLED"
                                ? "bg-warning"
                                : rooms?.status === "FULL"
                                  ? "bg-danger"
                                  : rooms?.status === "MAINTENANCE"
                                    ? "bg-secondary"
                                    : rooms?.status === "ROOM_RENT"
                                      ? "bg-success"
                                      : "bg-danger"
                          }`}
                        >
                          {rooms?.status === "AVAILABLE" && "Trống (Khả dụng)"}
                          {rooms?.status === "PARTIALLY_FILLED" && "Còn chỗ"}
                          {rooms?.status === "FULL" && "Đã đủ người"}
                          {rooms?.status === "MAINTENANCE" && "Đang bảo trì"}
                          {rooms?.status === "ROOM_RENT" && "Khả dụng"}
                          {rooms?.status === "HIRED" && "Đã đủ người"}
                          {rooms?.status === "CHECKED_OUT" && "Đã trả phòng"}
                        </span>
                      </li>
                      <li className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted"><i className="bi bi-people text-success me-2"></i> Số người tối đa</span>
                        <strong>{rooms?.maxOccupancy} người</strong>
                      </li>
                      <li className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted"><i className="bi bi-layers text-success me-2"></i> Tầng</span>
                        <strong>Tầng {rooms?.floor}</strong>
                      </li>
                      <li className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted"><i className="bi bi-wifi text-success me-2"></i> Tiền mạng</span>
                        <strong>{rooms?.internetCost?.toLocaleString("vi-VN")} đ/tháng</strong>
                      </li>
                      
                      {/* Hiển thị tiện ích (Assets) */}
                      {rooms && rooms.assets?.length > 0 && (
                        <div className="mt-4">
                          <h5 className="fw-bold fs-6 mb-3 text-uppercase text-muted">Tiện ích đi kèm</h5>
                          {rooms.assets.map((item, index) => (
                            <li key={index} className="d-flex justify-content-between py-1">
                              <span className="text-muted"><i className="bi bi-check2-circle text-primary me-2"></i> {item?.name}</span>
                              <strong>{item.number}</strong>
                            </li>
                          ))}
                        </div>
                      )}
                    </ul>
                  </div>
                </div>

                {/* CỘT PHẢI: MÔ TẢ & NGƯỜI ĐANG Ở */}
                <div className="col-lg-7">
                  {/* Bảng Mô Tả */}
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light mb-4">
                    <h4 className="fw-bold mb-3 fs-5"><i className="bi bi-card-text text-success me-2"></i> Mô tả chi tiết</h4>
                    <p className="description text-muted mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.8" }}>
                      {rooms ? rooms.description : "Đang cập nhật mô tả..."}
                    </p>
                  </div>

                  {/* Danh sách người đang ở */}
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                    <h4 className="fw-bold mb-4 fs-5">
                      <i className="bi bi-person-lines-fill text-success me-2"></i> Người đang ở 
                      <span className="badge bg-light text-dark border ms-2">
                        {rooms?.currentOccupancy ?? 0} / {rooms?.maxOccupancy ?? 0}
                      </span>
                    </h4>
                    
                    <div className="row g-3">
                      {rooms?.residents && rooms.residents.length > 0 ? (
                        rooms.residents.map((resident, index) => (
                          <div key={resident.id || index} className="col-md-6">
                            <div className="d-flex align-items-center p-3 border rounded-4 bg-light shadow-sm">
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
                                  <div className="text-muted mt-1" style={{ fontSize: "13px" }}>
                                    <i className="bi bi-telephone-fill me-1"></i> {resident.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-12 text-center py-4 bg-light rounded-4 border border-dashed">
                          <p className="text-muted mb-0 font-italic">
                            <i className="bi bi-info-circle me-1"></i> Chưa có ai đang ở trong phòng này.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* NGƯỜI CHO THUÊ & FORM LIÊN HỆ */}
              <div className="row mt-5 g-4">
                <div className="col-md-6">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
                    <h4 className="fw-bold mb-4 fs-5"><i className="bi bi-shield-check text-success me-2"></i> Thông tin quản lý</h4>
                    <div className="d-flex flex-column align-items-center text-center mb-4">
                      <img
                        src={rooms?.user?.imageUrl || "/assets/img/agent-4.jpg"}
                        alt="Quản lý"
                        className="rounded-circle shadow border border-3 border-success mb-3"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                      />
                      <h4 className="fw-bold mb-1">{rooms ? rooms.user?.name : "Đang tải..."}</h4>
                      <span className="badge bg-success rounded-pill px-3 py-2">Chủ nhà / Quản lý KTX</span>
                    </div>
                    
                    <ul className="list-unstyled bg-light p-3 rounded-4 border">
                      <li className="d-flex align-items-center mb-3">
                        <i className="bi bi-telephone-fill text-success fs-5 me-3"></i>
                        <span className="text-muted fw-bold">{rooms ? rooms.user?.phone : "N/A"}</span>
                      </li>
                      <li className="d-flex align-items-center mb-3">
                        <i className="bi bi-envelope-fill text-success fs-5 me-3"></i>
                        <span className="text-muted">{rooms ? rooms.user?.email : "N/A"}</span>
                      </li>
                      <li className="d-flex align-items-start">
                        <i className="bi bi-geo-alt-fill text-success fs-5 me-3 mt-1"></i>
                        <span className="text-muted">{rooms ? rooms.user?.address : "N/A"}</span>
                      </li>
                    </ul>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                      {rooms && rooms.user?.facebookUrl && (
                        <a href={rooms.user.facebookUrl} className="btn btn-outline-primary rounded-circle" target="_blank" rel="noreferrer" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-facebook fs-5"></i>
                        </a>
                      )}
                      {rooms && rooms.user?.zaloUrl && (
                        <a href={rooms.user.zaloUrl} className="btn btn-outline-info rounded-circle" target="_blank" rel="noreferrer" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-chat-dots-fill fs-5"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
                    <h4 className="fw-bold mb-4 fs-5"><i className="bi bi-envelope-paper text-success me-2"></i> Gửi tin nhắn</h4>
                    <form onSubmit={this.handleSubmit}>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light border-0"
                          placeholder="Tên của bạn *"
                          name="nameOfRentaler"
                          value={this.state.nameOfRentaler}
                          onChange={this.handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="email"
                          className="form-control form-control-lg bg-light border-0"
                          placeholder="Email của bạn *"
                          name="title"
                          value={this.state.title}
                          onChange={this.handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <textarea
                          className="form-control bg-light border-0"
                          placeholder="Nội dung lời nhắn *"
                          name="description"
                          value={this.state.description}
                          onChange={this.handleInputChange}
                          rows="5"
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-success btn-lg w-100 rounded-pill fw-bold shadow-sm">
                        <i className="bi bi-send-fill me-2"></i> Gửi ngay
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* BÌNH LUẬN VÀ ĐÁNH GIÁ */}
              <div className="row mt-5">
                <div className="col-12">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                    <h4 className="fw-bold mb-4 fs-5"><i className="bi bi-chat-left-text text-success me-2"></i> Bình luận và đánh giá</h4>
                    
                    <div className="row">
                      <div className="col-lg-8">
                        {/* Danh sách bình luận */}
                        <Comment.Group size="large" className="w-100 mb-4">
                          {comments && comments.length > 0 ? (
                            comments.map((comment, index) => (
                              <Comment key={index} className="bg-light p-3 rounded-4 mb-3 border">
                                {comment.user?.imageUrl ? (
                                  <Comment.Avatar src={comment.user.imageUrl} className="rounded-circle shadow-sm" />
                                ) : (
                                  <Comment.Avatar src="/assets/img/agent-1.jpg" className="rounded-circle shadow-sm" />
                                )}
                                <Comment.Content className="ms-2">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <Comment.Author as="span" className="fw-bold fs-6">{comment.user?.name}</Comment.Author>
                                    <Comment.Metadata className="text-muted small">
                                      {comment.createdAt}
                                    </Comment.Metadata>
                                  </div>
                                  <Stack spacing={1} className="mb-2">
                                    <Rating name="read-only" value={comment.rateRating} precision={0.5} readOnly size="small" />
                                  </Stack>
                                  <Comment.Text className="text-dark mt-2">{comment.content}</Comment.Text>
                                </Comment.Content>
                              </Comment>
                            ))
                          ) : (
                            <p className="text-muted font-italic py-3">Chưa có đánh giá nào cho phòng này.</p>
                          )}
                        </Comment.Group>

                        {/* Form Bình Luận */}
                        {this.props.authenticated ? (
                          <div className="border-top pt-4">
                            {showCommentForm ? (
                              <Form onSubmit={this.handleSubmitComment} className="bg-light p-4 rounded-4 border">
                                <h5 className="fw-bold mb-3">Đánh giá chất lượng phòng</h5>
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
                                  placeholder="Vui lòng để lại trải nghiệm chân thực của bạn tại đây..."
                                  value={content}
                                  onChange={(event) => this.setState({ content: event.target.value })}
                                  style={{ borderRadius: '12px', border: '1px solid #dee2e6' }}
                                />
                                <div className="mt-3 d-flex gap-2">
                                  <Button type="submit" className="ui button green rounded-pill px-4" disabled={submittingComment}>
                                    {submittingComment ? "Đang gửi..." : "Gửi đánh giá"}
                                  </Button>
                                  <Button type="button" className="ui button basic rounded-pill" onClick={() => this.setState({ showCommentForm: false })}>
                                    Hủy
                                  </Button>
                                </div>
                              </Form>
                            ) : (
                              <button onClick={() => this.setState({ showCommentForm: true })} className="btn btn-outline-success rounded-pill px-4 fw-bold">
                                <i className="bi bi-pencil-square me-2"></i> Viết đánh giá
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="alert alert-warning rounded-4 border-0 shadow-sm d-inline-block">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i> Vui lòng <strong>đăng nhập</strong> để bình luận và đánh giá.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }
}

export default RentailHomeDetail;