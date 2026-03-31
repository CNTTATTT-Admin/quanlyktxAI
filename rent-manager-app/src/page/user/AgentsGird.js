import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { toast } from "react-toastify";
import Pagination from "./Pagnation";
import { getAllAccountRentalerForCustomer } from "../../services/fetch/ApiUtils";
import { Link } from "react-router-dom";

const AgentsGird = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, settableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const fetchData = () => {
    getAllAccountRentalerForCustomer(currentPage, itemsPerPage, searchQuery)
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
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
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
        <section className="intro-single pt-5 mt-5 pb-4">
          <div className="container mt-4">
            <div className="row align-items-center">
              <div className="col-md-12 col-lg-8">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold mb-2">NGƯỜI CHO THUÊ</h1>
                  <span className="color-text-a text-muted fs-6">
                    Danh sách chủ nhà và ban quản lý uy tín hàng đầu
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
                      Người cho thuê
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <section className="agents-grid grid">
          <div className="container">
            <div className="row mb-5 justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="bg-white p-2 rounded-pill shadow-sm border d-flex align-items-center">
                  <i className="bi bi-search text-muted fs-5 ms-3 me-2"></i>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none bg-transparent"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>

            <div className="row g-4 mb-5">
              {tableData.length > 0 ? (
                tableData.map((rentaler) => (
                  <div className="col-md-6 col-lg-4" key={rentaler.id}>
                    <div className="card h-100 rounded-4 shadow-sm border-0 overflow-hidden bg-white">
                      {/* Ảnh đại diện & Tên */}
                      <div className="position-relative">
                        <img
                          src={rentaler?.imageUrl || "assets/img/agent-4.jpg"}
                          alt={rentaler.name}
                          className="card-img-top w-100"
                          style={{ height: "350px", objectFit: "cover" }}
                        />
                        <div 
                          className="position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", height: "50%" }}
                        >
                          <h3 className="card-title text-white mb-1 fs-4 fw-bold">
                            <Link to={`/angent-single/${rentaler.id}`} className="text-white text-decoration-none">
                              {rentaler.name}
                            </Link>
                          </h3>
                          <div>
                            <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm">
                              Quản lý / Chủ nhà
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card-body p-4">
                        <ul className="list-unstyled mb-0">
                          <li className="d-flex align-items-start mb-3 pb-2 border-bottom border-light">
                            <i className="bi bi-geo-alt-fill text-success fs-5 me-3 mt-1"></i>
                            <span className="text-muted small">
                              {rentaler.address || "Chưa cập nhật địa chỉ"}
                            </span>
                          </li>
                          <li className="d-flex align-items-center mb-3 pb-2 border-bottom border-light">
                            <i className="bi bi-telephone-fill text-success fs-5 me-3"></i>
                            <strong className="text-dark">
                              {rentaler.phone || "Chưa cập nhật"}
                            </strong>
                          </li>
                          <li className="d-flex align-items-center mb-2">
                            <i className="bi bi-envelope-fill text-success fs-5 me-3"></i>
                            <span className="text-muted small text-truncate">
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
                              className="btn btn-outline-primary rounded-circle shadow-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyItems: "center" }}
                            >
                              <i className="bi bi-facebook fs-6"></i>
                            </a>
                          )}
                          {rentaler?.zaloUrl && (
                            <a
                              href={rentaler.zaloUrl}
                              className="btn btn-outline-info rounded-circle shadow-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyItems: "center" }}
                            >
                              <i className="bi bi-chat-dots-fill fs-6"></i>
                            </a>
                          )}
                        </div>
                        <Link
                          to={`/angent-single/${rentaler.id}`}
                          className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                        >
                          Chi tiết <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5 my-5">
                  <i className="bi bi-search text-muted mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                  <h4 className="fw-bold text-dark">Không tìm thấy kết quả</h4>
                  <p className="text-muted">Không có người cho thuê nào khớp với tìm kiếm của bạn.</p>
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-sm-12 d-flex justify-content-center mt-2">
                <Pagination
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  currentPage={currentPage}
                  paginate={paginate}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AgentsGird;