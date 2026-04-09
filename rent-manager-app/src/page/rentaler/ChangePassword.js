import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import { changePassword } from '../../services/fetch/ApiUtils';
import { toast } from 'react-toastify';

function ChangePassword(props) {
    console.log("Props:", props)
    const { authenticated, exit, role, currentUser, location, onLogout } = props;

    // ==========================================
    // 🧠 LOGIC & STATE GỐC CỦA BẠN (GIỮ NGUYÊN 100%)
    // ==========================================
    const [passwordRequest, setPasswordRequest] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        const changePasswordRequest = Object.assign({}, passwordRequest); 
        // Handle form submission logic
        changePassword(changePasswordRequest).then(response => {
            toast.success(response.message);
            exit();
        }).catch(error => {
            toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
        })
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPasswordRequest((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    // ==========================================
    // 🎨 GIAO DIỆN MỚI (ECOHOME STYLE)
    // ==========================================
    return (
        <>
            <style>{`
                .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .text-emerald { color: #10B981 !important; }
                .bg-emerald { background-color: #10B981 !important; color: white !important; }
                
                .modern-card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.03); background: #fff; }
                
                .modern-input { border-radius: 8px; border: 1px solid #E2E8F0; padding: 10px 15px; font-size: 0.95rem; background-color: #F8FAFC; transition: all 0.3s; }
                .modern-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); background-color: #fff; outline: none; }
                .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

                .btn-modern { border-radius: 50px; font-weight: 600; padding: 12px 24px; transition: all 0.3s; }
                .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                
                .input-group-text { background-color: #F8FAFC; border-color: #E2E8F0; color: #94A3B8; border-radius: 8px 0 0 8px; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                
                {/* Header Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="fw-bolder text-dark mb-1">Đổi mật khẩu</h2>
                        <p className="text-muted mb-0">Cập nhật mật khẩu để bảo mật tài khoản của bạn.</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="row justify-content-center mt-5">
                    <div className="col-12 col-lg-8 col-xl-6">
                        <div className="modern-card p-4 p-md-5">
                            
                            <div className="text-center mb-5">
                                <i className="bi bi-shield-lock-fill text-emerald display-1"></i>
                                <h3 className="fw-bolder text-dark mt-3">Cập nhật mật khẩu</h3>
                                <p className="text-muted">Nhập thông tin mật khẩu cũ và mật khẩu mới bên dưới.</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                
                                {/* Mật khẩu cũ */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="modern-label mb-0" htmlFor="inputPasswordOld">Mật khẩu hiện tại</label>
                                        <small><Link to="/forgot-password" className="text-emerald text-decoration-none fw-medium">Quên mật khẩu?</Link></small>
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="bi bi-key-fill fs-5"></i></span>
                                        <input
                                            type="password"
                                            className="form-control modern-input border-start-0"
                                            id="inputPasswordOld"
                                            name="oldPassword"
                                            value={passwordRequest.oldPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu bạn đang dùng..."
                                            required
                                            style={{borderRadius: '0 8px 8px 0'}}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-5 g-4">
                                    {/* Mật khẩu mới */}
                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="inputPasswordNew">Mật khẩu mới</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="bi bi-lock-fill fs-5"></i></span>
                                            <input
                                                type="password"
                                                className="form-control modern-input border-start-0"
                                                id="inputPasswordNew"
                                                name="newPassword"
                                                value={passwordRequest.newPassword}
                                                onChange={handleChange}
                                                placeholder="Mật khẩu mới..."
                                                required
                                                style={{borderRadius: '0 8px 8px 0'}}
                                            />
                                        </div>
                                    </div>

                                    {/* Xác nhận mật khẩu mới */}
                                    <div className="col-md-6">
                                        <label className="modern-label" htmlFor="inputPasswordNew2">Xác nhận mật khẩu mới</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="bi bi-lock-check-fill fs-5"></i></span>
                                            <input
                                                type="password"
                                                className="form-control modern-input border-start-0"
                                                id="inputPasswordNew2"
                                                name="confirmPassword"
                                                value={passwordRequest.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Nhập lại mật khẩu mới..."
                                                required
                                                style={{borderRadius: '0 8px 8px 0'}}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Nút bấm Submit */}
                                <div className="mt-5 pt-3 border-top text-end">
                                    <button type="submit" className="btn bg-emerald text-white btn-modern shadow-sm px-5 fs-5 w-100">
                                        <i className="bi bi-shield-check-fill me-2 fs-5"></i> Lưu
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ChangePassword;