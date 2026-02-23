import React, { Component } from "react";
import { Link, NavLink } from 'react-router-dom';
import './Profile.css';

class Header extends Component {


    render() {
        console.log("logout", this.props.onLogout)
        return (
            <>
                <nav className="navbar navbar-default navbar-trans navbar-expand-lg fixed-top">
                    <div className="container">
                        <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarDefault" aria-controls="navbarDefault" aria-expanded="false" aria-label="Toggle navigation">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                        <a className="navbar-brand text-brand" href="/">PhongTro<span className="color-b">SinhVien</span></a>

                        <div className="navbar-collapse collapse justify-content-center" id="navbarDefault">
                            <ul className="navbar-nav">

                                <li className="nav-item">
                                    <NavLink className="nav-link " to="/" activeClassName="active">
                                        Trang chủ
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink className="nav-link " to="/rental-home" activeClassName="active">
                                        Nhà cho thuê
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link " to="/contact" activeClassName="active">
                                        Liên hệ
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link " to="/angent-gird" activeClassName="active">
                                        Người cho thuê
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                        {!this.props.authenticated ? (
                            <>
                                <button type="button" className="btn btn-outline-success">
                                    <Link to="/login" activeClassName="active" style={{ textDecoration: 'none', color: 'green' }}>
                                        Đăng nhập
                                    </Link>
                                </button>
                                &nbsp;&nbsp;
                                <button type="button" className="btn btn-outline-success">
                                    <Link to="/signup" activeClassName="active" style={{ textDecoration: 'none', color: 'green' }}>
                                        Đăng kí
                                    </Link>
                                </button>
                                &nbsp;&nbsp;
                                <button type="button" className="btn btn-success">
                                    <Link to="/login-rentaler" activeClassName="active" style={{ textDecoration: 'none', color: 'white' }}>
                                        Đăng tin
                                    </Link>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="profile-info">
                                    <div className="profile-avatar">
                                        {
                                            this.props.currentUser.imageUrl ? (
                                                <img src={this.props.currentUser.imageUrl}
                                                    alt={this.props.currentUser.name} className="img-fluid rounded-circle border border-dark border-3"
                                                    style={{ width: "50px" }} />

                                            ) : (
                                                <div className="text-avatar" style={{    width: "50px",
                                                    height: "50px"}}>
                                                    <span style={{lineHeight: "50px"}}>{this.props.currentUser.name && this.props.currentUser.name[0]}</span>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <div className="d-flex flex-row align-items-center mb-2">
                                            <p className="mb-0 me-2">{this.props.currentUser.name}</p>
                                            <ul className="mb-0 list-unstyled d-flex flex-row" style={{ color: "#1B7B2C" }}>
                                                <li>
                                                    <i className="fas fa-star fa-xs"></i>
                                                </li>
                                                <li>
                                                    <i className="fas fa-star fa-xs"></i>
                                                </li>
                                                <li>
                                                    <i className="fas fa-star fa-xs"></i>
                                                </li>
                                                <li>
                                                    <i className="fas fa-star fa-xs"></i>
                                                </li>
                                                <li>
                                                    <i className="fas fa-star fa-xs"></i>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <Link to="/profile">
                                                <button type="button" className="btn btn-outline-dark btn-rounded btn-sm"
                                                    data-mdb-ripple-color="dark">Hồ Sơ</button>&nbsp;
                                            </Link>
                                            <button type="button" className="btn btn-outline-dark btn-rounded btn-sm"
                                                data-mdb-ripple-color="dark" onClick={this.props.onLogout}>Đăng xuất</button>
                                        </div>
                                    </div>
                                    
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </>
        )
    }
}

export default Header;