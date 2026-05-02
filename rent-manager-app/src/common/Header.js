import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Profile.css";
import logo from "../assets/img/logo.jpg";

class Header extends Component {
  render() {
    console.log("logout", this.props.onLogout);
    return (
      <>
        <style>{`
          .spread-nav-container {
            flex-grow: 1;
            display: flex;
            justify-content: center;
          }
          
          .spread-nav-list {
            width: 80%;
            display: flex;
            justify-content: space-evenly;
            margin: 0 auto;
          }

          .nav-link {
            font-weight: 500;
            font-size: 1.05rem;
            color: #333 !important;
          }
          
          .nav-link.active, .nav-link:hover {
            color: #0d6efd !important; 
          }
          
          .auth-btn {
            font-weight: 600;
            white-space: nowrap;
          }
        `}</style>

        {/* Trả lại bộ class gốc */}
        <nav className="navbar navbar-default navbar-trans navbar-expand-lg fixed-top shadow-sm bg-white">
          <div className="container-fluid px-4">
            {/* Nút Toggle cho Mobile */}
            <button
              className="navbar-toggler collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarDefault"
              aria-controls="navbarDefault"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            {/* Logo - ĐÃ THÊM marginLeft để đẩy sang phải một chút */}
            <a className="navbar-brand text-brand" href="/" style={{ marginLeft: "30px" }}>
              <img src={logo} alt="KtxAI" style={{ height: "50px" }} />
            </a>

            <div className="navbar-collapse collapse" id="navbarDefault">
              
              {/* DANH SÁCH MENU DÀN ĐỀU */}
              <div className="spread-nav-container">
                <ul className="navbar-nav spread-nav-list">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/" activeClassName="active" exact>Trang chủ</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/rental-home" activeClassName="active">Phòng cho thuê</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/contact" activeClassName="active">Liên hệ</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/policy" activeClassName="active">Nội quy</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/angent-gird" activeClassName="active">Người cho thuê</NavLink>
                  </li>
                  {(!this.props.authenticated || this.props.currentUser?.allocatedRoomId != null) && (
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/check-in-out" activeClassName="active">Điểm danh</NavLink>
                    </li>
                  )}
                </ul>
              </div>
              
              {/* VÙNG THÔNG TIN USER / ĐĂNG NHẬP */}
              <div className="d-flex align-items-center">
                {!this.props.authenticated ? (
                  <div className="d-flex align-items-center gap-3">
                    <Link to="/login" className="btn btn-outline-primary auth-btn rounded-pill px-4">Đăng nhập</Link>
                    <Link to="/signup" className="btn btn-primary auth-btn rounded-pill px-4">Đăng kí</Link>
                    <div className="vr d-none d-lg-block text-secondary"></div>
                    <Link to="/login-rentaler" className="btn btn-success auth-btn rounded-pill px-4">Đăng tin</Link>
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {this.props.currentUser.imageUrl ? (
                        <img src={this.props.currentUser.imageUrl} alt={this.props.currentUser.name} className="rounded-circle border" style={{width: "45px", height: "45px", objectFit: "cover"}} />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center text-white rounded-circle bg-primary" style={{ width: "45px", height: "45px", fontSize: "1.2rem", fontWeight: "bold" }}>
                          {this.props.currentUser.name && this.props.currentUser.name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold me-2">{this.props.currentUser.name}</span>
                        <span className="text-warning small">
                          <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <Link to="/profile" className="btn btn-outline-dark btn-sm rounded-pill px-3">Hồ Sơ</Link>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={this.props.onLogout}>Đăng xuất</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </nav>
      </>
    );
  }
}

export default Header;