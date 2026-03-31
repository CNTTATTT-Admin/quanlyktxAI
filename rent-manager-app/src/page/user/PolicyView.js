import React, { useEffect, useState } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getPolicy } from "../../services/fetch/ApiUtils";

const PolicyView = (props) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolicy()
      .then((response) => {
        setPolicy(response);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Không thể tải nội quy. Vui lòng thử lại sau!");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header
        authenticated={props.authenticated}
        currentUser={props.currentUser}
        onLogout={props.onLogout}
      />
      <main id="main" className="bg-light pb-5">
        <section className="intro-single pt-5 mt-5 pb-4">
          <div className="container mt-4">
            <div className="row align-items-center">
              <div className="col-md-12 col-lg-8">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold mb-2">Nội quy chung</h1>
                  <span className="color-text-a text-muted fs-6">
                    Các quy định và nội quy tại Ký túc xá
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
                      Nội quy
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-single">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-10 col-lg-9">
                <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light">
                  {loading ? (
                    <div className="text-center py-5 my-5">
                      <div className="spinner-border text-success" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <p className="text-muted mt-3">Đang tải dữ liệu nội quy...</p>
                    </div>
                  ) : policy ? (
                    <>
                      <div className="d-flex flex-column align-items-center mb-5 border-bottom pb-4">
                        <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center mb-3 shadow-sm" style={{ width: "60px", height: "60px", fontSize: "28px" }}>
                          <i className="bi bi-journal-text"></i>
                        </div>
                        <h2 className="text-center text-success display-6 fw-bold mb-0">
                          {policy.title}
                        </h2>
                      </div>
                      
                      <div
                        className="policy-body text-dark px-md-3"
                        style={{
                          whiteSpace: "pre-line",
                          lineHeight: "1.9",
                          fontSize: "1.1rem",
                          textAlign: "justify",
                        }}
                      >
                        {policy.content}
                      </div>

                      <div className="mt-5 pt-4 border-top text-muted d-flex align-items-center justify-content-end">
                        <i className="bi bi-clock-history me-2"></i>
                        <span>
                          Ngày cập nhật cuối cùng:{" "}
                          <strong className="text-dark">
                            {new Date(policy.updatedAt).toLocaleDateString("vi-VN")}
                          </strong>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 my-4">
                      <i className="bi bi-file-earmark-x text-muted mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                      <h3 className="fw-bold text-dark">Chưa có nội quy</h3>
                      <p className="text-muted">Nội quy đang được ban quản lý cập nhật. Vui lòng quay lại sau!</p>
                    </div>
                  )}
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

export default PolicyView;