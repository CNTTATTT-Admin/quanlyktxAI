// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// import required modules

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRoom } from "../../../services/fetch/ApiUtils";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { API_BASE_URL } from "../../../constants/Connect";
import { formatVnd } from "../../../utils/currency";

import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import { Button, Comment, Form } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import axios from "axios";

const ModalRoomDetails = ({ roomId }) => {
  const [comments, setComments] = useState();
  const [roomData, setRoomData] = useState({
    title: "",
    description: "",
    price: 0,
    latitude: 0.0,
    longitude: 0.0,
    address: "",
    locationId: 0,
    category: [
      {
        id: "",
        name: "",
      },
    ],
    assets: [{ name: "", number: "" }],
    roomMedia: [],
    user: "",
  });

  useEffect(() => {
    getRoom(roomId)
      .then((response) => {
        const room = response;
        setRoomData((prevState) => ({
          ...prevState,
          ...room,
        }));
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
    fetchComments();
  }, [roomId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/room/${roomId}/comments`,
      );
      const comments = response.data; // Assuming API returns comments data
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  return (
    <>
      <style>{`
        .text-emerald { color: #10B981 !important; }
        .bg-emerald { background-color: #10B981 !important; color: white !important; }
        
        .modern-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modern-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(16, 185, 129, 0.1) !important; }
        
        .amenity-card { transition: all 0.3s ease; cursor: default; }
        .amenity-card:hover { background-color: #D1FAE5 !important; border-color: #10B981 !important; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1); }
        
        .resident-card { transition: all 0.3s ease; border: 1px solid #f1f5f9; }
        .resident-card:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.15) !important; border-color: #10B981 !important; }
        
        .img-overlay-gradient { background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); }
        .input-modern { border-radius: 8px; border: 1px solid #dee2e6; transition: all 0.3s ease; }
        .input-modern:focus { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important; border-color: #10B981 !important; transform: translateY(-1px); }
        .btn-modern { transition: all 0.3s ease; }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3) !important; }
      `}</style>

      <div className="container-fluid p-0">
        <div className="row g-4">
          
          <div className="col-lg-8 d-flex flex-column gap-4">
            
            <div className="bg-white rounded-4 shadow-sm border-0 position-relative overflow-hidden modern-card">
              <Swiper
                navigation={true}
                modules={[Navigation]}
                className="swiper-wrapper"
                style={{ backgroundColor: "#f8f9fa", borderRadius: "16px" }}
              >
                {roomData.roomMedia && roomData.roomMedia.length > 0 ? (
                  roomData.roomMedia.map((item, index) => (
                    <SwiperSlide key={index} className="carousel-item-b swiper-slide">
                      <img
                        src={API_BASE_URL + "/document/" + item.files}
                        alt="Room"
                        style={{ width: "100%", height: "450px", objectFit: "cover", borderRadius: "16px" }}
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide className="carousel-item-b swiper-slide">
                    <img
                      src="/assets/img/property-1.jpg"
                      alt="Mặc định"
                      style={{ width: "100%", height: "450px", objectFit: "cover", borderRadius: "16px" }}
                    />
                  </SwiperSlide>
                )}
              </Swiper>
              <div className="position-absolute bottom-0 start-0 w-100 p-4 img-overlay-gradient" style={{ zIndex: 10, borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
                <h2 className="text-white fw-bold mb-1" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                  {roomData?.title || "Đang tải..."}
                </h2>
                <span className="text-light fw-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                  <i className="bi bi-geo-alt-fill text-emerald me-1"></i>
                  {roomData?.location?.cityName || roomData?.location?.name || roomData?.address || "Chưa cập nhật"}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-4 shadow-sm border-0 modern-card">
              <h5 className="fw-bold text-emerald mb-3">Mô tả chi tiết</h5>
              <p className="text-muted mb-0" style={{ whiteSpace: "pre-line", lineHeight: "1.8", fontSize: "0.95rem" }}>
                {roomData.description || "Chưa có mô tả chi tiết."}
              </p>
            </div>

            <div className="bg-white p-4 rounded-4 shadow-sm border-0 modern-card">
              <h5 className="fw-bold text-emerald mb-3">Tài sản & Tiện nghi</h5>
              {roomData.assets && roomData.assets.length > 0 && roomData.assets[0].name !== "" ? (
                <div className="row g-3">
                  {roomData.assets.map((asset, index) => (
                    <div key={index} className="col-md-4 col-6">
                      <div className="amenity-card d-flex align-items-center justify-content-between text-muted bg-light p-3 rounded-3 border">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-check-circle-fill text-emerald me-2"></i>
                          <span className="small fw-semibold text-truncate">{asset.name}</span>
                        </div>
                        <span className="badge bg-white text-dark border shadow-sm px-2 py-1">{asset.number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0 font-italic">Chưa kê khai tài sản cho phòng này.</p>
              )}
            </div>

            <div className="bg-white p-4 rounded-4 shadow-sm border-0 modern-card">
              <h5 className="fw-bold mb-4 fs-5 text-dark d-flex align-items-center">
                <i className="bi bi-person-lines-fill text-emerald me-2"></i> Người đang ở
                <span className="badge bg-light text-dark border ms-3 rounded-pill fw-semibold shadow-sm">
                  {roomData?.currentOccupancy ?? 0} / {roomData?.maxOccupancy ?? 0}
                </span>
              </h5>

              <div className="row g-3">
                {roomData?.residents && roomData.residents.length > 0 ? (
                  roomData.residents.map((resident, index) => (
                    <div key={resident.id || index} className="col-md-6 col-lg-4">
                      <div className="resident-card d-flex align-items-center p-3 rounded-4 bg-white shadow-sm">
                        <img
                          src={resident.imageUrl || "/assets/img/agent-1.jpg"}
                          alt={resident.name}
                          className="rounded-circle shadow-sm border border-2 border-emerald"
                          style={{ width: "50px", height: "50px", objectFit: "cover", flexShrink: 0 }}
                        />
                        <div className="ms-3 overflow-hidden">
                          <div className="fw-bold text-dark text-truncate" style={{ fontSize: "14px" }}>
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

            <div className="bg-white p-4 rounded-4 shadow-sm border-0 modern-card">
              <h5 className="fw-bold mb-4 fs-5 text-dark">
                <i className="bi bi-chat-left-text-fill text-emerald me-2"></i> Bình luận và đánh giá
              </h5>
              <Comment.Group size="large" className="w-100">
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
                    Chưa có đánh giá nào.
                  </div>
                )}
              </Comment.Group>
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column gap-4">
            
            <div className="bg-white p-4 rounded-4 shadow-sm border-0 text-center modern-card">
              <p className="text-muted small fw-bold text-uppercase mb-1">Mức giá thuê</p>
              <h2 className="fw-bolder mb-0 text-emerald" style={{ fontSize: "2rem" }}>
                {formatVnd(roomData?.price)}
              </h2>
              <p className="text-muted small mb-4">/ tháng</p>
              
              <div className="border-top pt-4 text-start">
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  <li className="d-flex justify-content-between align-items-start text-muted small">
                    <span className="text-nowrap me-3"><i className="bi bi-upc-scan me-2 opacity-75"></i>Mã phòng</span>
                    <strong className="text-dark text-end">#{roomId}</strong>
                  </li>
                  <li className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-tags-fill me-2 opacity-75"></i>Phân loại</span>
                    <strong className="text-dark">{roomData.category?.name || roomData.category?.[0]?.name || "Chưa có"}</strong>
                  </li>

                  <li className="d-flex justify-content-between align-items-center text-muted small">
                    <span><i className="bi bi-info-circle-fill me-2 opacity-75"></i>Trạng thái</span>
                    <span
                      className={`badge rounded-pill fw-semibold ${roomData?.status === "AVAILABLE" || roomData?.status === "ROOM_RENT"
                          ? "bg-emerald"
                          : roomData?.status === "PARTIALLY_FILLED"
                            ? "bg-warning text-dark"
                            : roomData?.status === "FULL" || roomData?.status === "HIRED"
                              ? "bg-danger"
                              : "bg-secondary"
                        }`}
                    >
                      {roomData?.status === "AVAILABLE" && "Trống"}
                      {roomData?.status === "PARTIALLY_FILLED" && "Còn chỗ"}
                      {roomData?.status === "FULL" && "Đã đủ người"}
                      {roomData?.status === "MAINTENANCE" && "Bảo trì"}
                      {roomData?.status === "ROOM_RENT" && "Khả dụng"}
                      {roomData?.status === "HIRED" && "Đã đủ người"}
                      {roomData?.status === "CHECKED_OUT" && "Đã trả phòng"}
                      {!roomData?.status && "Chưa cập nhật"}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-people-fill me-2 opacity-75"></i>Sức chứa</span>
                    <strong className="text-dark">{roomData?.maxOccupancy} người</strong>
                  </li>
                  <li className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-layers-fill me-2 opacity-75"></i>Tầng</span>
                    <strong className="text-dark">Tầng {roomData?.floor}</strong>
                  </li>
                  <li className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-wifi me-2 opacity-75"></i>Tiền mạng</span>
                    <strong className="text-dark">{formatVnd(roomData?.internetCost)}/tháng</strong>
                  </li>
                  <li className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-droplet-fill me-2 opacity-75"></i>Tiền nước</span>
                    <strong className="text-dark">{formatVnd(roomData?.waterCost)}/tháng</strong>
                  </li>
                  <li className="d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-lightning-charge-fill me-2 opacity-75"></i>Tiền điện</span>
                    <strong className="text-dark">{formatVnd(roomData?.publicElectricCost)}/tháng</strong>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-4 shadow-sm border-0 modern-card">
              <h5 className="fw-bold mb-4 fs-6 text-dark d-flex align-items-center border-bottom pb-2">
                <i className="bi bi-shield-check text-emerald fs-4 me-2"></i> Người quản lý
              </h5>
              <div className="d-flex align-items-center mb-4">
                <img
                  src={roomData.user?.imageUrl || "/assets/img/agent-4.jpg"}
                  alt="Quản lý"
                  className="rounded-circle shadow-sm border border-2 border-emerald me-3"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
                <div>
                  <h6 className="fw-bold mb-1 text-dark">{roomData.user?.name || "Đang tải..."}</h6>
                  <span className="badge bg-light text-emerald border rounded-pill shadow-sm">Chủ nhà</span>
                </div>
              </div>
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex align-items-center">
                  <i className="bi bi-telephone-fill text-muted me-3 w-15px"></i>
                  <span className="text-dark fw-bold">{roomData.user?.phone || "N/A"}</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope-fill text-muted me-3 w-15px"></i>
                  <span className="text-muted text-truncate">{roomData.user?.email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* <div className="bg-white p-4 rounded-4 shadow-sm border-0 modern-card">
              <h5 className="fw-bold text-dark text-start mb-3">Gửi tin nhắn</h5>
              <form className="text-start">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light input-modern py-2"
                    placeholder="Tên của bạn *"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control form-control-sm bg-light input-modern py-2"
                    placeholder="Email liên hệ *"
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    className="form-control bg-light input-modern p-3"
                    placeholder="Nhập lời nhắn..."
                    rows="3"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn bg-emerald btn-modern w-100 rounded-pill fw-bold shadow-sm text-white border-0 py-2">
                  <i className="bi bi-send-fill me-2"></i> Gửi yêu cầu
                </button>
              </form>
            </div> */}

          </div>
        </div>
      </div>
    </>
  );
};

export default ModalRoomDetails;