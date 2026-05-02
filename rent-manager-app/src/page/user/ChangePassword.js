import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import { changePassword } from '../../services/fetch/ApiUtils';
import { toast } from 'react-toastify';
import Header from '../../common/Header';
import Footer from '../../common/Footer';

function ChangePasswordOfUser(props) {
    // ==========================================
    // 🧠 LOGIC & API GIỮ NGUYÊN 100%
    // ==========================================
    console.log("Props:", props)
    const { authenticated, exit, role, currentUser, location, onLogout } = props;

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
        }
        )
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
    // 🎨 GIAO DIỆN MỚI (CHUẨN DASHBOARD - FIX SIDEBAR)
    // ==========================================
    return (
        <>
            <style>{`
                /* KHỞI TẠO NỀN & KHỬ VỠ FONT */
                .eco-page-bg {
                    background-color: #F8FAFC;
                    min-height: calc(100vh - 70px);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    display: flex;
                    flex-direction: column;
                }

                /* KHẮC PHỤC LỖI KHOẢNG ĐEN & TRÀN FOOTER CỦA SIDEBAR */
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

                /* CONTAINER NỘI DUNG FORM - CĂN GIỮA MÀN HÌNH */
                .eco-main-wrapper { 
                    padding: 40px 30px; 
                    width: 100%; 
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }

                .eco-card-form {
                    background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(79, 70, 229, 0.05);
                    border: 1px solid #EEF2FF; overflow: hidden; width: 100%; max-width: 550px; /* Thu gọn form cho đẹp */
                }

                .eco-card-header {
                    background-color: #ffffff; padding: 30px 30px 20px 30px; border-bottom: 1px solid #EEF2FF;
                    text-align: center;
                }

                .eco-title-icon { color: #4F46E5; font-size: 2.5rem; margin-bottom: 15px; display: inline-block; }

                /* STYLE CÁC INPUT VÀ SELECT */
                .eco-form-label {
                    font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;
                }

                .eco-input-field {
                    background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; font-size: 1rem; color: #1E293B; transition: all 0.3s; width: 100%;
                }

                .eco-input-field:focus {
                    background-color: #ffffff; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); outline: none;
                }

                /* LINK QUÊN MẬT KHẨU */
                .eco-forgot-link {
                    font-size: 0.85rem; font-weight: 600; color: #4F46E5; text-decoration: none; transition: color 0.2s;
                }
                .eco-forgot-link:hover { color: #4338CA; text-decoration: underline; }

                /* NÚT SUBMIT NỔI BẬT */
                .eco-btn-submit {
                    background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%); color: #ffffff; font-weight: 600; font-size: 1.05rem;
                    padding: 14px 20px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
                    transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-top: 10px;
                }
                .eco-btn-submit:hover {
                    transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35); color: #ffffff;
                }
            `}</style>

            <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
            
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
                            
                            <div className="eco-card-form">
                                <div className="eco-card-header">
                                    <i className="bi bi-shield-lock-fill eco-title-icon"></i>
                                    <h4 className="fw-bold text-dark mb-1">Thay đổi mật khẩu</h4>
                                    <h6 className="text-muted mb-0" style={{fontSize: "0.95rem"}}>
                                        Bảo mật tài khoản của bạn bằng một mật khẩu mạnh.
                                    </h6>
                                </div>
                                
                                <div className="card-body p-4 p-md-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label className="eco-form-label mb-0" htmlFor="inputPasswordCurrent">Mật khẩu cũ</label>
                                                <a href="/forgot-password" className="eco-forgot-link">Quên mật khẩu?</a>
                                            </div>
                                            <input
                                                type="password"
                                                className="eco-input-field"
                                                id="inputPasswordCurrent"
                                                name="oldPassword"
                                                placeholder="Nhập mật khẩu hiện tại"
                                                value={passwordRequest.oldPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        
                                        <hr className="my-4 text-muted" style={{opacity: 0.15}} />
                                        
                                        <div className="mb-4">
                                            <label className="eco-form-label" htmlFor="inputPasswordNew">Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                className="eco-input-field"
                                                id="inputPasswordNew"
                                                name="newPassword"
                                                placeholder="Nhập mật khẩu mới"
                                                value={passwordRequest.newPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="mb-5">
                                            <label className="eco-form-label" htmlFor="inputPasswordNew2">Xác nhận mật khẩu mới</label>
                                            <input
                                                type="password"
                                                className="eco-input-field"
                                                id="inputPasswordNew2"
                                                name="confirmPassword"
                                                placeholder="Nhập lại mật khẩu mới"
                                                value={passwordRequest.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        
                                        <button type="submit" className="eco-btn-submit">
                                            <i className="bi bi-check-circle-fill"></i> Cập nhật mật khẩu
                                        </button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default ChangePasswordOfUser;