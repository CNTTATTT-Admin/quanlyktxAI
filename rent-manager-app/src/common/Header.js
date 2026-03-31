import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Profile.css";
import logo from "../assets/img/logo.jpg";

class Header extends Component {
  render() {
    console.log("logout", this.props.onLogout);
    return (
      <>
        <nav className="navbar navbar-default navbar-trans navbar-expand-lg fixed-top">
          <div className="container">
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
            <a className="navbar-brand text-brand" href="/">
              <img src={logo} alt="KtxAI" style={{ height: "50px" }} />
            </a>

            <div
              className="navbar-collapse collapse justify-content-center"
              id="navbarDefault"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/"
                    activeClassName="active"
                    exact
                  >
                    Trang chủ
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/rental-home"
                    activeClassName="active"
                  >
                    Phòng cho thuê
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/contact"
                    activeClassName="active"
                  >
                    Liên hệ
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/policy"
                    activeClassName="active"
                  >
                    Nội quy
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/angent-gird"
                    activeClassName="active"
                  >
                    Người cho thuê
                  </NavLink>
                </li>
                {(!this.props.authenticated ||
                  this.props.currentUser?.allocatedRoomId != null) && (
                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/check-in-out"
                      activeClassName="active"
                    >
                      Điểm danh
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
            
            {!this.props.authenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-outline-success"
                  style={{ textDecoration: "none" }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-outline-success"
                  style={{ textDecoration: "none" }}
                >
                  Đăng kí
                </Link>
                <Link
                  to="/login-rentaler"
                  className="btn btn-success"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Đăng tin
                </Link>
              </div>
            ) : (
              <div className="profile-info d-flex align-items-center">
                <div className="profile-avatar">
                  {this.props.currentUser.imageUrl ? (
                    <img
                      src={this.props.currentUser.imageUrl}
                      alt={this.props.currentUser.name}
                      className="img-fluid rounded-circle border border-dark border-3"
                      style={{ width: "50px" }}
                    />
                  ) : (
                    <div
                      className="text-avatar d-flex justify-content-center align-items-center bg-success text-white rounded-circle"
                      style={{ width: "50px", height: "50px", fontSize: "1.2rem", fontWeight: "bold" }}
                    >
                      {this.props.currentUser.name && this.props.currentUser.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="d-flex flex-row align-items-center mb-1">
                    <p className="mb-0 me-2 fw-bold">{this.props.currentUser.name}</p>
                    <ul
                      className="mb-0 list-unstyled d-flex flex-row"
                      style={{ color: "#1B7B2C" }}
                    >
                      <li><i className="fas fa-star fa-xs"></i></li>
                      <li><i className="fas fa-star fa-xs"></i></li>
                      <li><i className="fas fa-star fa-xs"></i></li>
                      <li><i className="fas fa-star fa-xs"></i></li>
                      <li><i className="fas fa-star fa-xs"></i></li>
                    </ul>
                  </div>
                  <div className="d-flex gap-2 mt-1">
                    <Link to="/profile">
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-rounded btn-sm"
                      >
                        Hồ Sơ
                      </button>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-rounded btn-sm"
                      onClick={this.props.onLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </>
    );
  }
}

export default Header;