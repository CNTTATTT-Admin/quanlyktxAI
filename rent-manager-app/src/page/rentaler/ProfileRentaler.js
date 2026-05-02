import { useState } from "react";
import Nav from "./Nav";
import SidebarNav from "./SidebarNav";
import "../../assets/css/Profile.css";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/axios/AuthService";

const ProfileRentaler = (props) => {
    const { authenticated, role, currentUser, location, onLogout } = props;

    const [imageFile, setImageFile] = useState(null);
    const [zalo, setZalo] = useState(currentUser?.zaloUrl);
    const [facebook, setFacebook] = useState(currentUser?.facebookUrl);

    const handleZaloChange = (event) => {
        setZalo(event.target.value);
    };

    const handleFacebookChange = (event) => {
        setFacebook(event.target.value);
    };

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Perform file validation
            const allowedTypes = ["image/jpeg", "image/png"];
            const maxFileSize = 10 * 1024 * 1024; // 10MB

            // Check file type
            if (!allowedTypes.includes(file.type)) {
                toast.error("Only JPEG and PNG images are allowed.");
                return;
            }

            // Check file size
            if (file.size > maxFileSize) {
                toast.error("File size exceeds the maximum limit of 10MB.");
                return;
            }

            setImageFile(file);
        }
    };

    const handleSubmit = (event) => {
        // Prepare data for updating the user profile
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('zalo', zalo);
        formData.append('facebook', facebook)

        event.preventDefault();
        // Handle form submission

        AuthService.uploadProfile(formData).then(response => {
            toast.success(response.message);
            toast.success("Cập nhật thông tin cá nhân thành công.");
            props.loadCurrentUser();
        }).catch(error => {
            toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
        })
    };

    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <>
            <style>{`
                .eco-bg { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .text-emerald { color: #10B981 !important; }
                .bg-emerald { background-color: #10B981 !important; color: white !important; }
                
                .modern-card { border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.03); background: #fff; overflow: hidden; }
                
                .modern-input { border-radius: 8px; border: 1px solid #E2E8F0; padding: 10px 15px; font-size: 0.95rem; background-color: #F8FAFC; transition: all 0.3s; }
                .modern-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); background-color: #fff; outline: none; }
                .modern-input:disabled, .modern-input[readonly] { background-color: #F1F5F9; color: #64748B; cursor: not-allowed; border-color: #E2E8F0; }
                
                .modern-label { font-weight: 600; color: #475569; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

                .btn-modern { border-radius: 8px; font-weight: 600; padding: 12px 24px; transition: all 0.3s; }
                .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                
                /* Header Profile Styles */
                .profile-banner { height: 140px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); position: relative; }
                .profile-avatar-wrapper { position: relative; margin-top: -60px; margin-left: 30px; display: inline-block; }
                .profile-avatar-large { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); object-fit: cover; background-color: #fff; }
                .profile-avatar-text { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background-color: #10B981; color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; }
                
                .section-title { font-size: 1.1rem; font-weight: 700; color: #0F172A; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #F1F5F9; }
            `}</style>

            <div className="container-fluid p-4 eco-bg">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-9 col-lg-10">
                        
                        {/* HEADER CARD */}
                        <div className="modern-card mb-4">
                            <div className="profile-banner"></div>
                            <div className="d-flex flex-column flex-sm-row px-4 pb-4">
                                <div className="profile-avatar-wrapper">
                                    {
                                        currentUser && currentUser.imageUrl ? (
                                            <img src={currentUser.imageUrl} alt={currentUser.name} className="profile-avatar-large" />
                                        ) : (
                                            <div className="profile-avatar-text">
                                                <span>{currentUser && currentUser.name && currentUser.name[0]}</span>
                                            </div>
                                        )
                                    }
                                    <span 
                                        className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle" 
                                        style={{width: '24px', height: '24px', marginBottom: '8px', marginRight: '8px'}}
                                        title="Đang hoạt động"
                                    ></span>
                                </div>
                                <div className="mt-sm-3 mt-3 ms-sm-4">
                                    <h2 className="fw-bolder text-dark mb-1">{currentUser && currentUser.name}</h2>
                                    <p className="text-muted d-flex align-items-center mb-2">
                                        <i className="bi bi-envelope-fill me-2 text-emerald"></i>
                                        {currentUser && currentUser.email}
                                    </p>
                                    <span className="badge bg-emerald text-white rounded-pill px-3 py-1 shadow-sm">
                                        <i className="bi bi-shield-check me-1"></i> Quản lý / Chủ trọ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* FORM CARD */}
                        <div className="modern-card p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                
                                {/* --- KHU VỰC 1: THÔNG TIN CỐ ĐỊNH --- */}
                                <div className="mb-5">
                                    <h5 className="section-title d-flex align-items-center">
                                        <i className="bi bi-person-vcard-fill text-secondary me-2"></i> 
                                        Thông tin cơ bản <span className="badge bg-light text-secondary border ms-3 fs-6 fw-normal"><i className="bi bi-lock-fill"></i> Chỉ xem</span>
                                    </h5>
                                    <div className="row g-4">
                                        <div className="col-md-12">
                                            <label className="modern-label" htmlFor="inputName">Họ và Tên</label>
                                            <input type="text" className="form-control modern-input fw-bold text-dark" name="name" value={currentUser && currentUser.name} id="inputName" placeholder="Peter Parker" disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="modern-label" htmlFor="inputEmail4">Email</label>
                                            <input type="email" className="form-control modern-input" name="email" value={currentUser && currentUser.email} id="inputEmail4" placeholder="Email" disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="modern-label" htmlFor="inputPhone">Số điện thoại</label>
                                            <input type="text" className="form-control modern-input" name="phone" value={currentUser && currentUser.phone} id="inputPhone" placeholder="Số điện thoại" disabled />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="modern-label" htmlFor="inputAddress">Địa chỉ</label>
                                            <input type="text" className="form-control modern-input" name="address" value={currentUser && currentUser.address} id="inputAddress" placeholder="Địa chỉ hiện tại" disabled />
                                        </div>
                                    </div>
                                </div>

                                {/* --- KHU VỰC 2: THÔNG TIN CẬP NHẬT --- */}
                                <div className="mb-4">
                                    <h5 className="section-title d-flex align-items-center text-emerald border-emerald">
                                        <i className="bi bi-pencil-square me-2"></i> 
                                        Thông tin liên hệ & Ảnh đại diện
                                    </h5>
                                    
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label className="modern-label">Tải Ảnh Đại Diện Mới</label>
                                            <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-image"></i></span>
                                                <input 
                                                    className="form-control modern-input border-start-0 bg-white" 
                                                    accept=".png, .jpeg, .jpg, image/jpeg, image/png" 
                                                    type="file" 
                                                    onChange={onFileChange} 
                                                    style={{borderRadius: "0 8px 8px 0"}}
                                                />
                                            </div>
                                            <small className="text-muted mt-1 d-block">* Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 10MB.</small>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="modern-label" htmlFor="inputZalo">Liện hệ Zalo</label>
                                            <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                                <span className="input-group-text bg-primary text-white border-primary"><i className="bi bi-chat-dots-fill"></i></span>
                                                <input 
                                                    type="text" 
                                                    className="form-control modern-input border-start-0 bg-white" 
                                                    name="zalo"
                                                    value={zalo || ""}
                                                    onChange={handleZaloChange}
                                                    id="inputZalo" 
                                                    placeholder="https://zalo.me/..." 
                                                    style={{borderRadius: "0 8px 8px 0"}}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="modern-label" htmlFor="inputFacebook">Liên Hệ Facebook</label>
                                            <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                                <span className="input-group-text text-white border-0" style={{backgroundColor: "#1877F2"}}><i className="bi bi-facebook"></i></span>
                                                <input 
                                                    type="text" 
                                                    className="form-control modern-input border-start-0 bg-white" 
                                                    name="facebook"
                                                    value={facebook || ""}
                                                    onChange={handleFacebookChange}
                                                    id="inputFacebook" 
                                                    placeholder="https://facebook.com/..." 
                                                    style={{borderRadius: "0 8px 8px 0"}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NÚT SUBMIT */}
                                <div className="mt-5 pt-3 border-top text-end">
                                    <button type="submit" className="btn bg-emerald text-white btn-modern shadow-sm px-5 fs-5 w-100">
                                        <i className="bi bi-save2-fill me-2"></i> Lưu Thay Đổi
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfileRentaler;