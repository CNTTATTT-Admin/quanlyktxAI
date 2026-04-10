import React, { useState, useEffect } from "react";
import SidebarNav from './SidebarNav';
import { getAccountById, sendEmailForRentaler } from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";
import { Navigate, useParams } from "react-router-dom";
import Nav from "./Nav";

function SendEmail(props) {

    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [nameOfRentaler, setNameOfRentaler] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        getAccountById(id).then(response => {
            setToEmail(response.email)
            setNameOfRentaler(response.name)
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    }, []);

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
        sendEmailForRentaler(id, sendEmailRequest).then(response => {
            console.log(response.message)
            toast.success(response.message)
            setTitle('');
            setDescription('');
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    };

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-admin",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <style>{`
                .eco-card {
                    background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.05);
                    border: 1px solid #EFF6FF; overflow: hidden; margin-bottom: 24px;
                }

                .eco-card-header {
                    background-color: #ffffff; padding: 20px 30px; border-bottom: 1px solid #EFF6FF;
                }

                .eco-form-label {
                    font-size: 0.9rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: block;
                }

                .eco-input-field {
                    background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 18px; font-size: 1.05rem; color: #1E293B; transition: all 0.3s; width: 100%;
                }

                .eco-input-field:focus {
                    background-color: #ffffff; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); outline: none;
                }

                .eco-btn-primary {
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; font-weight: 600; font-size: 1rem;
                    padding: 12px 30px; border-radius: 10px; border: none; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
                    transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                }
                .eco-btn-primary:hover {
                    transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35); color: #ffffff;
                }
            `}</style>

            <div className="container-fluid p-0">
                <h1 className="h3 mb-4 fw-bold text-dark d-flex align-items-center">
                    <i className="bi bi-envelope-paper-fill me-2" style={{ color: "#3B82F6", fontSize: "1.8rem" }}></i>
                    Gửi Email Thông Báo
                </h1>

                <div className="row">
                    <div className="col-12 col-xl-8">
                        <div className="eco-card">
                            <div className="eco-card-header">
                                <h5 className="fw-bold text-dark mb-0">Soạn Email Cho Người Cho Thuê</h5>
                            </div>
                            <div className="card-body p-4 p-md-5">
                                <form onSubmit={handleSubmit}>
                                    
                                    {/* Hàng 1: Xếp Email và Tên nằm ngang nhau */}
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <label className="eco-form-label">Email người nhận</label>
                                            <input
                                                type="email"
                                                className="eco-input-field"
                                                name="toEmail"
                                                value={toEmail}
                                                onChange={handleToEmailChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="eco-form-label">Tên chủ bài đăng</label>
                                            <input
                                                type="text"
                                                className="eco-input-field"
                                                name="nameOfRentaler"
                                                value={nameOfRentaler}
                                                onChange={handleRentalerChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="eco-form-label">Tiêu đề mail</label>
                                        <input
                                            type="text"
                                            className="eco-input-field fw-bold"
                                            style={{ color: "#3B82F6" }}
                                            name="title"
                                            placeholder="Nhập tiêu đề email..."
                                            value={title}
                                            onChange={handleTitleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-5">
                                        <label className="eco-form-label">Lời nhắn / Nội dung</label>
                                        <textarea
                                            className="eco-input-field"
                                            placeholder="Soạn nội dung chi tiết để gửi cho người cho thuê..."
                                            rows="6"
                                            style={{ minHeight: "150px", resize: "vertical", lineHeight: "1.6" }}
                                            name="description"
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="pt-2 border-top" style={{ borderColor: "#EFF6FF" }}>
                                        <button type="submit" className="eco-btn-primary mt-3">
                                            <i className="bi bi-send-fill"></i> Gửi Email Ngay
                                        </button>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SendEmail;