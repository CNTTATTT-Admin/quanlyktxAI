import React, { useState } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { Link } from "react-router-dom";
import { sendEmailForContact } from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";

const Contact = (props) => {
  const [title, setTitle] = useState("");
  const [nameOfRentaler, setNameOfRentaler] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [description, setDescription] = useState("");

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleRentalerChange = (event) => {
    setNameOfRentaler(event.target.value);
  };

  const handleToEmailChange = (event) => {
    setToEmail(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendEmailRequest = { title, nameOfRentaler, toEmail, description };
    sendEmailForContact(sendEmailRequest)
      .then((response) => {
        console.log(response.message);
        toast.success(response.message);
        setTitle("");
        setDescription("");
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
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
                  <h1 className="title-single fw-bold mb-2">Liên hệ chúng tôi</h1>
                  <span className="color-text-a text-muted fs-6">
                    Nếu bạn có thắc mắc hãy liên hệ tới chúng tôi. Chúng tôi sẽ sớm trả lời cho bạn.
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
                    <li className="breadcrumb-item active text-muted" aria-current="page">
                      Liên hệ
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* NỘI DUNG LIÊN HỆ */}
        <section className="contact">
          <div className="container">
            {/* BẢN ĐỒ */}
            <div className="row mb-5">
              <div className="col-sm-12">
                <div className="contact-map box rounded-4 overflow-hidden shadow-sm border border-light bg-white p-2">
                  <div id="map" className="contact-map rounded-3 overflow-hidden">
                    <iframe
                      src="https://maps.google.com/maps?q=Hanoi%20University%20of%20Civil%20Engineering&t=&z=15&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="450"
                      frameBorder="0"
                      style={{ border: "0" }}
                      allowFullScreen
                      title="Google Map"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM & THÔNG TIN */}
            <div className="row g-4">
              {/* CỘT TRÁI: FORM GỬI TIN NHẮN */}
              <div className="col-lg-7">
                <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light h-100">
                  <h3 className="fw-bold mb-4 fs-4">
                    <i className="bi bi-envelope-paper text-success me-2"></i> Gửi lời nhắn cho chúng tôi
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small mb-1">Họ và Tên <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="nameOfRentaler"
                          value={nameOfRentaler}
                          onChange={handleRentalerChange}
                          className="form-control form-control-lg bg-light border-0"
                          placeholder="Nhập họ tên..."
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-bold small mb-1">Email <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          name="toEmail"
                          value={toEmail}
                          onChange={handleToEmailChange}
                          className="form-control form-control-lg bg-light border-0"
                          placeholder="Nhập email..."
                          required
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted fw-bold small mb-1">Tiêu đề <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="title"
                          value={title}
                          onChange={handleTitleChange}
                          className="form-control form-control-lg bg-light border-0"
                          placeholder="Vấn đề bạn cần hỗ trợ là gì?"
                          required
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted fw-bold small mb-1">Nội dung <span className="text-danger">*</span></label>
                        <textarea
                          name="description"
                          value={description}
                          onChange={handleDescriptionChange}
                          className="form-control bg-light border-0"
                          cols="45"
                          rows="6"
                          placeholder="Chi tiết lời nhắn của bạn..."
                          required
                        ></textarea>
                      </div>
                      <div className="col-md-12 mt-4">
                        <button type="submit" className="btn btn-success btn-lg px-5 rounded-pill fw-bold shadow-sm">
                          <i className="bi bi-send-fill me-2"></i> Gửi tin nhắn
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* CỘT PHẢI: THÔNG TIN LIÊN HỆ */}
              <div className="col-lg-5">
                <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light h-100">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: "60px", height: "60px", fontSize: "24px" }}>
                      <i className="bi bi-headset"></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0 fs-4">Thông tin liên hệ</h3>
                      <span className="text-muted small">Ban quản lý sẵn sàng hỗ trợ bạn</span>
                    </div>
                  </div>
                  
                  <div className="contact-info mt-4">
                    <ul className="list-unstyled">
                      <li className="d-flex mb-4">
                        <i className="bi bi-geo-alt-fill text-success fs-4 me-3 mt-1"></i>
                        <div>
                          <strong className="d-block text-dark mb-1">Địa chỉ</strong>
                          <span className="text-muted">1234 Đường ABC, Thành phố XYZ</span>
                        </div>
                      </li>
                      <li className="d-flex mb-4">
                        <i className="bi bi-telephone-fill text-success fs-4 me-3 mt-1"></i>
                        <div>
                          <strong className="d-block text-dark mb-1">Điện thoại</strong>
                          <span className="text-muted">+1 234 5678</span>
                        </div>
                      </li>
                      <li className="d-flex mb-4">
                        <i className="bi bi-envelope-fill text-success fs-4 me-3 mt-1"></i>
                        <div>
                          <strong className="d-block text-dark mb-1">Email</strong>
                          <span className="text-muted">info@example.com</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* KẾT NỐI MẠNG XÃ HỘI */}
                  <div className="mt-5 border-top pt-4">
                    <strong className="d-block text-dark mb-3">Kết nối với chúng tôi:</strong>
                    <div className="d-flex gap-2">
                      <a href="#" className="btn btn-outline-success rounded-circle" style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-facebook fs-5"></i>
                      </a>
                      <a href="#" className="btn btn-outline-success rounded-circle" style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-youtube fs-5"></i>
                      </a>
                      <a href="#" className="btn btn-outline-success rounded-circle" style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-instagram fs-5"></i>
                      </a>
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
};

export default Contact;