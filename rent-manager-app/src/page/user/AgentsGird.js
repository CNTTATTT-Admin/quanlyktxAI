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
      <main id="main" style={{ backgroundColor: "#F0FDF4", minHeight: "100vh" }} className="pt-5 mt-4 pb-5">
        <section className="intro-single pt-5 pb-2">
          <div className="container mt-4">
            <div className="row align-items-center">

              {/* Cột trái: Tiêu đề chi tiết */}
              <div className="col-md-12 col-lg-6">
                <div className="title-single-box">
                  <h1 className="title-single fw-bold text-dark" style={{ fontSize: "2.2rem" }}>Người cho thuê</h1>
                  <span className="text-muted fw-semibold mt-2 d-block">
                    Danh sách chủ nhà và ban quản lý uy tín hàng đầu.
                  </span>
                </div>
              </div>

              {/* Cột phải: Breadcrumb nằm ngang */}
              <div className="col-md-12 col-lg-6 d-flex justify-content-lg-end mt-4 mt-lg-0">
                <nav aria-label="breadcrumb" className="breadcrumb-box bg-white px-4 py-2 rounded-pill shadow-sm border">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/" className="text-decoration-none fw-semibold" style={{ color: "#10B981" }}>Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item active text-muted fw-semibold">
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
                              className="btn btn-primary rounded-circle shadow-sm"
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
                              className="btn btn-primary rounded-circle shadow-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                fill="white"
                                className="fs-6"
                                viewBox="0 0 50 50"
                              >
                                <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z"></path>
                              </svg>
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