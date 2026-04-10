import React, { useEffect, useState } from "react";
import SidebarNav from "./SidebarNav";
import { getAllBlogStore, getAllFollow } from "../../services/fetch/ApiUtils";
import Pagination from "./Pagnation";
import { toast } from "react-toastify";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { API_BASE_URL } from "../../constants/Connect";

function SaveBlog(props) {

  const { authenticated, role, currentUser, location, onLogout } = props;
  const history = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = () => {
    getAllBlogStore(currentPage, itemsPerPage)
      .then((response) => {
        setTableData(response.content);
        setTotalItems(response.totalElements);
      })
      .catch((error) => {
        toast.error(
          (error && error.message) ||
            "Oops! Có điều gì đó xảy ra. Vui lòng thử lại!",
        );
      });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!authenticated) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          state: { from: location },
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        .eco-page-bg {
          background-color: #F8FAFC;
          min-height: calc(100vh - 70px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          display: flex;
          flex-direction: column;
        }

        .wrapper { display: flex; align-items: stretch; width: 100%; flex-grow: 1; }
        
        #sidebar.sidebar {
          background-color: #ffffff !important; position: relative !important; align-self: stretch !important; 
          min-height: 100% !important; width: 260px !important; min-width: 260px !important; max-width: 260px !important;
          border-right: 1px solid #EEF2FF; z-index: 1000; top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
        }

        .sidebar-content {
          position: sticky !important; top: 70px !important; height: calc(100vh - 70px) !important;
          overflow-y: auto !important; background-color: #ffffff !important; display: flex; flex-direction: column;
        }
        
        .sidebar-content::-webkit-scrollbar { width: 4px; }
        .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

        .main { flex-grow: 1; min-width: 0; }

        .eco-main-wrapper { padding: 30px; width: 100%; }

        .eco-card-container {
          background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
          border: 1px solid #EEF2FF; overflow: hidden;
        }

        .eco-card-header {
          background-color: #ffffff; padding: 25px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
          display: flex; justify-content: space-between; align-items: center;
        }

        .eco-title-icon { color: #4F46E5; margin-right: 10px; font-size: 1.3rem; }

        .eco-room-card {
          background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03); 
          transition: all 0.3s ease; display: flex; flex-direction: column; height: 100%; overflow: hidden; position: relative;
        }
        .eco-room-card:hover {
          transform: translateY(-5px); box-shadow: 0 12px 30px rgba(79, 70, 229, 0.12); border-color: #C7D2FE;
        }

        .eco-room-img-wrapper { height: 220px; overflow: hidden; position: relative; }
        .eco-room-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .eco-room-card:hover .eco-room-img { transform: scale(1.05); }
        
        .eco-room-badge {
          position: absolute; top: 15px; right: 15px; padding: 6px 12px; border-radius: 8px; 
          font-size: 0.8rem; font-weight: 700; z-index: 2; box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
          backdrop-filter: blur(4px); letter-spacing: 0.3px;
        }
        .eco-badge-rent { background-color: rgba(16, 185, 129, 0.95); color: #ffffff; }
        .eco-badge-hired { background-color: rgba(245, 158, 11, 0.95); color: #ffffff; }
        .eco-badge-checkout { background-color: rgba(100, 116, 139, 0.95); color: #ffffff; }

        .eco-room-info { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
        
        .eco-room-title {
          font-size: 1.15rem; font-weight: 800; color: #1E293B; text-decoration: none; transition: color 0.2s; 
          margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .eco-room-title:hover { color: #4F46E5; }
        
        .eco-room-desc {
          color: #64748B; font-size: 0.85rem; line-height: 1.5; margin-bottom: 15px; 
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        
        .eco-room-price { font-size: 1.25rem; font-weight: 800; color: #E11D48; margin-bottom: 15px; }

        .eco-room-details { margin: 0; padding: 0; list-style: none; flex-grow: 1; border-top: 1px dashed #E2E8F0; padding-top: 15px;}
        .eco-room-details li { display: flex; align-items: flex-start; font-size: 0.85rem; color: #475569; margin-bottom: 8px; font-weight: 500; }
        .eco-room-details li i { color: #4F46E5; margin-right: 10px; font-size: 1rem; width: 16px; text-align: center; }

        .eco-btn-detail {
          display: block; text-align: center; background-color: #EEF2FF; color: #4F46E5; padding: 10px; 
          border-radius: 8px; font-weight: 700; text-decoration: none; transition: all 0.3s; margin-top: auto;
        }
        .eco-btn-detail:hover { background-color: #4F46E5; color: #ffffff; }

        .eco-pagination .page-item .page-link {
          color: #475569; background-color: #ffffff; border: 1px solid #E2E8F0; padding: 8px 16px; 
          margin: 0 4px; border-radius: 8px; font-weight: 600; transition: all 0.2s ease;
        }
        .eco-pagination .page-item.active .page-link {
          z-index: 3; color: #ffffff; background-color: #4F46E5; border-color: #4F46E5; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }
        .eco-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
          background-color: #EEF2FF; color: #4F46E5; border-color: #C7D2FE;
        }
      `}</style>

      <Header
        authenticated={authenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <div style={{ marginTop: "90px" }}></div>
      
      <main id="main" className="eco-page-bg">
        <div className="wrapper">
          <nav id="sidebar" className="sidebar js-sidebar">
            <div className="sidebar-content js-simplebar">
              <SidebarNav />
            </div>
          </nav>

          <div className="main">
            <div className="eco-main-wrapper">
              
              <div className="eco-card-container">
                <div className="eco-card-header">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">
                      <i className="bi bi-journal-bookmark-fill eco-title-icon"></i>
                      Lưu bài đăng
                    </h4>
                    <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                      Quản lý các tin đăng phòng trọ mà bạn đã lưu lại.
                    </h6>
                  </div>
                  {/* thừa */}
                  {/* <div className="text-muted opacity-50 d-none d-sm-block" style={{fontSize: "2rem"}}>
                    <i className="bi bi-bookmarks-fill"></i>
                  </div> */}
                </div>
                
                <div className="card-body p-4">
                  {tableData.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-journal-x text-muted fs-1 mb-3 d-block" style={{opacity: 0.3}}></i>
                      <span className="text-muted fw-semibold" style={{fontSize: "1.1rem"}}>Bạn chưa lưu bài đăng nào.</span>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {tableData.map((item, index) => (
                        <div className="col-sm-6 col-lg-4" key={item.id || index}>
                          <div className="eco-room-card">
                            
                            {/* BADGE TRẠNG THÁI */}
                            {item?.room.status === "ROOM_RENT" && <span className="eco-room-badge eco-badge-rent">Cho thuê</span>}
                            {item?.room.status === "HIRED" && <span className="eco-room-badge eco-badge-hired">Đã thuê</span>}
                            {item?.room.status === "CHECKED_OUT" && <span className="eco-room-badge eco-badge-checkout">Đã trả phòng</span>}

                            {/* ẢNH PHÒNG */}
                            <div className="eco-room-img-wrapper">
                              {item?.room.roomMedia && item?.room.roomMedia[0] ? (
                                <img
                                  src={API_BASE_URL + "/document/" + item?.room.roomMedia[0].files}
                                  alt={item?.room.title}
                                  className="eco-room-img"
                                />
                              ) : (
                                <img
                                  src="assets/img/property-1.jpg"
                                  alt="Default Room"
                                  className="eco-room-img"
                                />
                              )}
                            </div>
                            
                            {/* THÔNG TIN CHI TIẾT */}
                            <div className="eco-room-info">
                              <Link to={`/rental-home/${item?.room.id}`} className="eco-room-title">
                                {item?.room.title}
                              </Link>
                              
                              <div className="eco-room-price">
                                {item?.room.price?.toLocaleString("vi-VN")} đ
                              </div>

                              <p className="eco-room-desc">
                                {item?.room.description}
                              </p>
                              
                              <ul className="eco-room-details">
                                <li>
                                  <i className="bi bi-geo-alt-fill"></i>
                                  <span>{item?.room.location?.cityName || "Chưa cập nhật"}</span>
                                </li>
                                <li>
                                  <i className="bi bi-tags-fill"></i>
                                  <span>{item?.room.category?.name || "Chưa phân loại"}</span>
                                </li>
                                <li>
                                  <i className="bi bi-person-badge-fill"></i>
                                  <span>{item?.room.user?.name || "Chưa rõ"}</span>
                                </li>
                              </ul>

                              <Link to={`/rental-home/${item?.room.id}`} className="eco-btn-detail mt-3">
                                Xem chi tiết <i className="bi bi-arrow-right ms-1"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                    <div className="d-flex justify-content-center mt-5 mb-2">
                      <Pagination
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        currentPage={currentPage}
                        paginate={paginate}
                      />
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

export default SaveBlog;